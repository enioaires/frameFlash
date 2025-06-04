/* eslint-disable @typescript-eslint/no-explicit-any */

import { INewComment, IUpdateComment } from "@/types";
import { appwriteConfig, database } from "../config";

import { Query } from "appwrite";
import { v4 } from "uuid";

// ==================== COMMENTS CRUD ====================

export async function createComment(comment: INewComment) {
  try {
    const newComment = await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      v4(),
      {
        content: comment.content,
        postId: comment.postId,
        userId: comment.userId,
        parentCommentId: comment.parentCommentId || null,
      }
    );

    if (!newComment) throw Error;

    return newComment;
  } catch (error) {
    console.log("Error creating comment:", error);
    throw error;
  }
}

export async function updateComment(comment: IUpdateComment) {
  try {
    const updatedComment = await database.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      comment.commentId,
      {
        content: comment.content,
      }
    );

    if (!updatedComment) throw Error;

    return updatedComment;
  } catch (error) {
    console.log("Error updating comment:", error);
    throw error;
  }
}

export async function deleteComment(commentId: string) {
  try {
    const statusCode = await database.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      commentId
    );

    if (!statusCode) throw Error;

    return { status: "Ok" };
  } catch (error) {
    console.log("Error deleting comment:", error);
    throw error;
  }
}

export async function getCommentsByPostId(postId: string) {
  try {
    const comments = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      [
        Query.equal("postId", postId),
        Query.orderDesc("$createdAt"),
        Query.limit(100)
      ]
    );

    if (!comments) throw Error;

    return comments;
  } catch (error) {
    console.log("Error getting comments:", error);
    throw error;
  }
}

export async function getCommentById(commentId: string) {
  try {
    const comment = await database.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      commentId
    );

    if (!comment) throw Error;

    return comment;
  } catch (error) {
    console.log("Error getting comment by ID:", error);
    throw error;
  }
}

// ==================== UTILITY FUNCTIONS ====================

export async function getCommentsCount(postId: string) {
  try {
    const comments = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      [
        Query.equal("postId", postId),
        Query.limit(1000) // Para contar todos
      ]
    );

    return comments.total || comments.documents.length;
  } catch (error) {
    console.log("Error getting comments count:", error);
    return 0;
  }
}