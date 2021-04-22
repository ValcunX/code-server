import { Router, Request } from "express"
import { promises as fs } from "fs"
import * as path from "path"
import { rootPath } from "../constants"
import { authenticated, redirect, replaceTemplates } from "../http"

export enum Cookie {
  Key = "key",
}

const getRoot = async (req: Request, error?: Error): Promise<string> => {
  const content = await fs.readFile(path.join(rootPath, "src/browser/pages/logout.html"), "utf8")
  console.log(process.env.LOGOUT_REDIRECT_URL)
  const logoutRegirectURL = process.env.LOGOUT_REDIRECT_URL ?? "/login"

  return replaceTemplates(
    req,
    content
      .replace(/{{LOGOUT_REDIRECT_URL}}/g, logoutRegirectURL)
      .replace(/{{ERROR}}/, error ? `<div class="error">${error.message}</div>` : ""),
  )
}

export const router = Router()

router.use((req, res, next) => {
  const to = (typeof req.query.to === "string" && req.query.to) || "/"
  if (authenticated(req)) {
    return redirect(req, res, to, { to: undefined })
  }
  next()
})

router.get("/", async (req, res) => {
  res.send(await getRoot(req))
})
