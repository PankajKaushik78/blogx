import { z } from 'zod';

export const signupInput = z.object({
    email: z.string().email(),
    password: z.string(),
    name: z.string().optional()
})

export type SignupInput = z.infer<typeof signupInput>;

export const signinInput = z.object({
    email: z.string().email(),
    password: z.string().optional()
})

export type SignInInput = z.infer<typeof signinInput>;

export const createPost = z.object({
    title: z.string(),
    content: z.string()
})

export type CreatePost = z.infer<typeof createPost>;

export const updatePostInput = z.object({
    title: z.string().optional(),
    content: z.string().optional(),
});

export type UpdatePostType = z.infer<typeof updatePostInput>;