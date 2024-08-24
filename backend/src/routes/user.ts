import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { Bindings, Variables } from "../types";
import { signupInput, signinInput } from "@100xdevs/medium-common";

export const userRouter = new Hono<{
  Bindings: Bindings,
  Variables: Variables
}>()

userRouter.post('/signup', async (c) => {
  const body = await c.req.json();
  const { success } = signupInput.safeParse(body);
  if (!success) {
    c.status(400);
    return c.json({
      message: "invalid input"
    })
  }

  // generating client on each request because its a serverless application
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL
  }).$extends(withAccelerate())

  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        name: body.name
      }
    })
    const payload = {
      userId: user.id,
      name: user.name
    }
    const token = await sign(payload, c.env.JWT_SECRET)
    return c.json({ token: token });
  } catch (e) {
    console.log("Exception: ---", e);
    c.status(403)
    return c.json({message: "something went wrong"});
  }
})

userRouter.post('/signin', async (c) => {
  const body = await c.req.json();

  const { success } = signinInput.safeParse(body);
  if (!success) {
    c.status(400);
    return c.json({
      message: "invalid input"
    })
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL
  }).$extends(withAccelerate())

  try {
    // not checking for pw for now
    const user = await prisma.user.findUnique({
      where: {
        email: body.email
      }
    });
    if (!user) {
      c.status(403);
      return c.json({
        message: "No such user exists"
      });
    }
    const token = await sign({ userId: user.id, name: user.name }, c.env.JWT_SECRET);
    return c.json({ token });
  } catch (e) {

  }
})