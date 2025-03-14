'use client';
import { createContext, ReactNode, useContext, useState } from "react";
import { useOrbis } from "@orbisclub/components";
import { ORBIS_CONTEXT } from "@/constants";
import { Post } from "@/types";

interface GlobalContextType {
    posts: Post[];
    loadingPosts: boolean;
    postsError: string | null;
    fetchPosts: (context: string) => Promise<void>;
}
const initialValue = {
    posts: [],
    loadingPosts: false,
    postsError: null,
    fetchPosts: async () => { },
}

export const GlobalContext = createContext<GlobalContextType>(initialValue);

const GlobalContextProvider = ({ children }: { children: ReactNode }) => {

    const [value, setValue] = useState(0)
    const { orbis, user } = useOrbis();

    const [loadingPosts, setLoadingPosts] = useState(false);
    const [postsError, setPostsError] = useState<string | null>(null);
    const [posts, setPosts] = useState<Post[] | []>([]);

    const fetchPosts = async (context: string) => {
        setLoadingPosts(true)
        try {
            let { data, error } = await orbis.getPosts({ context });

            if (data) {
                setPosts(data);
            }
            setPostsError(error)
        } catch (error) {
            console.log("Error", error);
            setPostsError('Error in fetching posts');
        } finally {
            setLoadingPosts(false)
        }
    }


    return (
        <GlobalContext.Provider
            value={{
                posts,
                loadingPosts,
                postsError,
                fetchPosts
            }}
        >
            {children}
        </GlobalContext.Provider>
    )

}

export default GlobalContextProvider

export const useRewardsContext = () => {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error('useRewardsContext must be used within an RewardsContextProvider');
    }
    return context;
};