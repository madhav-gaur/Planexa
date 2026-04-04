import React from 'react'
import { useEffect } from 'react';
import { useRef } from 'react';
import { useSelector } from 'react-redux';

const Comments = ({ comments }) => {
    const containerRef = useRef(null);
    const user = useSelector((state) => state.user.userDetails);
    const { workspaceMember } = useSelector(state => state.workspace)

    console.log(workspaceMember)


    console.log(comments)
    useEffect(() => {
        const el = containerRef.current;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    }, []);
    return (
        <div className='task-comment-container' ref={containerRef}>
            {comments.map((item, idx) => {
                const temp = workspaceMember.find(memb => memb._id == item.userId).email
                const email = temp?.split('@')[0];
                return <div key={item._id + idx} className={`task-comment ${item.userId == user._id ? 'my-comment' : ""}`}>
                    <div className="task-comment-item ">
                        <p>{item.message}</p>
                        <span>{item.userId != user._id && `@${email}`}</span>
                    </div>
                </div>
            })}
        </div>
    )
}

export default Comments
