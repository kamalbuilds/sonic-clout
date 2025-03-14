export type UserProfile = {
    did: string;
    profile: null | {
        pfp: string;
    };
    stream_id: null | string;
    encrypted_email: null | string;
    verified_email: null | string;
    metadata: {
        chain: string;
        address: string;
        ensName: null | string;
    };
    nonces: {
        global: number;
        solana: number;
    };
    a_r: number;
    count_followers: number;
    count_following: number;
    twitter_details: null | any;
    github_details: null | any;
    hasLit: boolean;
}