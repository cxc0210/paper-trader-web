import { NextResponse } from "next/server";

const backendBaseUrl = process.env.BACKEND_BASE_URL ?? "http://localhost:8080";

async function proxy(request: Request, context: RouteContext<"/api/[...path]">) {
  const { path } = await context.params;
  const requestUrl = new URL(request.url);
  const targetUrl = new URL(`/${path.join("/")}${requestUrl.search}`, backendBaseUrl);
  const headers = new Headers();

  for (const headerName of ["accept", "content-type", "cookie"]) {
    const value = request.headers.get(headerName);
    if (value) {
      headers.set(headerName, value);
    }
  }

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      cache: "no-store",
      duplex: "half",
    });

    const proxyResponse = new NextResponse(response.body, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("Content-Type") ?? "application/json" },
    });
    const setCookie = response.headers.get("Set-Cookie");
    if (setCookie) {
      proxyResponse.headers.set("Set-Cookie", setCookie);
    }
    return proxyResponse;
  } catch {
    return NextResponse.json(
      { code: 500, message: "无法连接后端服务", data: null },
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
