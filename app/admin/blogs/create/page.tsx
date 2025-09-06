import { Metadata } from "next";
import BlogForm from "../blog-form";

export const metadata: Metadata = {
  title: "Create Blog",
};

export default function CreateBlog() {
  return (
    <>
      <h1 className="h1-bold">Create Blog</h1>
      <div className="my-8">
        <BlogForm type="Create" />
      </div>
    </>
  );
}
