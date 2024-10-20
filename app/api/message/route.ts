import { db } from '@/db'
import { openai } from '@/lib/openai'
import { SendMessageValidator } from '@/lib/validators/SendMessageValidator'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { pinecone } from "@/lib/pinecone";
import { NextRequest } from 'next/server';

export const POST = async (req: NextRequest) => {
  // endpoint for asking a question to a pdf file

  const body = await req.json()

  const { getUser } = getKindeServerSession()
  const user = getUser()

  const userId = (await user)?.id

  if (!userId)
    return new Response('Unauthorized', { status: 401 })

  const { fileId, message } =
    SendMessageValidator.parse(body)

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  })

  if (!file)
    return new Response('Not found', { status: 404 })

  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  })

  // 1: vectorize message
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  })

  const pineconeIndex = pinecone.Index('nexus')

  const vectorStore = await PineconeStore.fromExistingIndex(
    embeddings,
    {
      pineconeIndex,
      namespace: file.id,
    }
  )

  const results = await vectorStore.similaritySearch(
    message,
    4
  )
  console.log('Pinecone similarity search results:', results);

  const prevMessages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: 6,
  })

  const formattedPrevMessages = prevMessages.map((msg) => ({
    role: msg.isUserMessage
      ? ('user' as const)
      : ('assistant' as const),
    content: msg.text,
  }))

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',  // Make sure this is the correct model name
    temperature: 0,  // Keeps the output deterministic and focused on the context
    stream: false,
    messages: [
      {
        role: 'system',
        content: `
          You are an assistant that helps users by retrieving and using specific context to answer their questions. 
          If the context provides enough information, give a clear and concise response. If the context is insufficient, say "This document does not provide enough information for that question. Please ask a question related to the document's contents."
          Always provide answers based on the context below. Do not hallucinate information.
          Format the response in markdown.
        `,
      },
      {
        role: 'user',
        content: `
          Here's the current conversation so far and relevant context to help answer my question:

          ----------------
          PREVIOUS CONVERSATION:
          ${formattedPrevMessages.map((message) => {
            return message.role === 'user' 
              ? `User: ${message.content}` 
              : `Assistant: ${message.content}`
          }).join('\n')}

          ----------------
          CONTEXT:
          ${results.map((r) => r.pageContent).join('\n\n')}

          USER INPUT: ${message}

          Please use the above information to answer my question. If you don't know the answer, just say that you don't know.`
      },
    ],
  });

  // No streaming output for now
  // Retrieve the completed and parsed output to present to user
  const assistantReply = response.choices?.[0]?.message?.content;

  if (assistantReply) {
    // Save the assistant's reply to the database
    await db.message.create({
      data: {
        text: assistantReply,
        isUserMessage: false,
        fileId,
        userId,
      },
    })

  // Return the assistant's reply to the client
    return new Response(JSON.stringify({ reply: assistantReply }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } else {
    // Handle cases where the assistant's reply is missing
    return new Response('No response from assistant.', { status: 500 })
  }
}