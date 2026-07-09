import 'express'

declare module 'express' {
  interface Request {
    userId?: string
    userRole?: string
    query: { [key: string]: string | undefined }
    body: any
  }

  interface ParamsDictionary {
    [key: string]: string
  }
}

export {}
