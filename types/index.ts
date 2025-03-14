import { UserProfile } from "./profile";

export type Post = {
    stream_id: string;
    content: PostContent;
    context: string;
    creator: string;
    creator_details: UserProfile;
    count_likes: number;
    count_haha: number;
    count_downvotes: number;
    count_replies: number;
    timestamp: number;
}

export type PostContent = {
    body: string;
    title: string;
    context: string;
}

export type CreatorDetails = {
    did: string;
    metadata: {
        chain: string;
        address: string;
        ensName: string;
    },
    count_followers: number;
    count_following: number;
    verified_email: string | null;
}

export type PostReactionType = "like" | "haha" | "downvote";