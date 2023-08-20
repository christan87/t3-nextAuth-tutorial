import Link from "next/link";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Image from "next/image";
import type { RouterOutputs } from "~/utils/api";
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export const PostView = (props: PostWithUser) => {
    const { post, author } = props;
    return (
      <div className="flex border-b border-slate-400 p-4 gap-3" key={post.id}>
        <Image 
          className="w-14 h-14 rounded-full" 
          src={author.profileImageUrl!} 
          alt="Author Profile Image" 
          width={56}
          height={56}
        />
        <div className="flex flex-col">
          <div className="flex gap-1 text-slate-300"> 
            <Link href={`/@${author.username}`}><span>{`@${author.username}`}</span></Link>
            <Link href={`/post/${author.id}`}><span className="font-thin">{`· ${dayjs(post.createdAt).fromNow()}`}</span></Link>
          </div>
          <span className="text-2xl">{post.content}</span>
        </div>
      </div>
    )
  }