import { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const token = await getToken({ req })
    if (!token) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Get user ID from query parameter
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId || userId !== token.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Upgrade the HTTP connection to a WebSocket connection
    if (req.headers.get("upgrade") !== "websocket") {
      return new Response("Expected websocket", { status: 426 })
    }

    try {
      // @ts-ignore - WebSocket is available in Edge runtime
      const { socket, response } = new WebSocket(req)

      socket.onmessage = (event) => {
        // Handle incoming messages
        console.log("Received message:", event.data)
      }

      socket.onerror = (error) => {
        console.error("WebSocket error:", error)
      }

      return response
    } catch (error) {
      console.error("WebSocket connection error:", error)
      return new Response("WebSocket connection failed", { status: 500 })
    }
  } catch (error) {
    console.error("Error in WebSocket route:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
