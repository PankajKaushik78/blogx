import { Hono } from "hono";
import { Bindings, Variables } from "../types";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { createBlogInput, updateBlogInput } from "@100xdevs/medium-common";

export const blogRouter = new Hono<{
  Bindings: Bindings,
  Variables: Variables
}>();

blogRouter.post('/', async (c) => {
  const body = await c.req.json();
  const { success } = createBlogInput.safeParse(body);
  if (!success) {
    c.status(400);
    return c.json({
      message: "invalid input"
    })
  }
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: c.get("userId"),
      }
    })
    return c.json({
      message: "Post created successfully",
      id: post.id
    })
  } catch (e) {
    console.log(e);
    c.status(500);
    return c.json({ message: "Something went wrong" });
  }
})

blogRouter.put('/', async (c) => {
  const body = await c.req.json();

  const { success } = updateBlogInput.safeParse(body);
  if (!success) {
    c.status(400);
    return c.json({
      message: "invalid input"
    })
  }
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    console.log("id is ", body.id, "user is ", c.get("userId"));
    
    const post = await prisma.post.update({
      where: {
        id: body.id,
        authorId: c.get("userId")
      },
      data: {
        title: body.title,
        content: body.content,
      }
    })
    return c.json({
      message: "Post updated successfully",
      id: post.id
    })
  } catch (e) {
    console.log(e);
    c.status(500);
    return c.json({ message: "Something went wrong" });
  }
})

blogRouter.get('/bulk', async (c) => {
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    // Get all the posts
    const posts = await prisma.post.findMany({});

    // Find for current user only
    // const posts = await prisma.post.findMany({
    //   where: {
    //     authorId: c.get("userId")
    //   }
    // });
    return c.json({
      posts
    })
  } catch (e) {
    c.status(500);
    return c.json({ message: "Something went wrong" });
  }
})

blogRouter.get('/:id', async (c) => {
  const blogId = c.req.param('id');
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    const post = await prisma.post.findUnique({
      where: {
        id: blogId,
        authorId: c.get("userId")
      }
    })
    return c.json({
      post
    })
  } catch (e) {
    console.log(e);
    c.status(500);
    return c.json({ message: "Something went wrong" });
  }
})
