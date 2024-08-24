import { Hono } from 'hono'
import { jwt, sign, verify } from 'hono/jwt'
import { showRoutes } from 'hono/dev'
import { Bindings, Variables } from './types'
import { userRouter } from './routes/user'
import { blogRouter } from './routes/blog'


const app = new Hono<{
  Bindings: Bindings,
  Variables: Variables
}>()

app.use('/api/v1/blog/*', async (c, next) => {
  console.log("inside the middleware");
  
  const header = c.req.header('Authorization');
  const token = header?.split(" ")[1];
  if (!token) return c.status(403);
  try {
    const claims = await verify(token, c.env.JWT_SECRET);
    if (!claims) {
      c.status(403);
      return c.json({ message: "unauthorized" });
    }
    c.set("userId", claims.userId as string);
    c.set("name", claims.name as string);
    await next();
  } catch (e) {
    c.status(403);
    return c.json({ message: "unauthorized" });
  }
})

app.get('/', (c) => {
  console.log(showRoutes(app));
  return c.text('Hello Hono!')
})

app.route('/api/v1/user', userRouter);
app.route('/api/v1/blog', blogRouter);


export default app
