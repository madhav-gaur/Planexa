import React from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import Axios from '../utils/axios'
import { apiList } from '../common/apiList'
import { setIsWorkspaceLoaded } from '../store/workspace.slice'
import { useState } from 'react'

const InvitePage = () => {
  const dispatch = useDispatch()

  const params = useParams()
  const [joining, setJoining] = useState(false)
  const token = params.inviteToken
  const navigate = useNavigate()
  const user = useSelector(state => state.user.userDetails)

  const { isUserLoaded } = useSelector(state => state.user)

  useEffect(() => {
    if (!token) return
    if (isUserLoaded && !user) {

      localStorage.setItem("inviteToken", token);
      navigate("/sign-in")
    }
    if (user) {
      const joinWorkspace = async () => {

        try {
          setJoining(true)
          const res = await Axios({
            ...apiList.joinWorkspace,
            data: { token }
          });
          if (res.data.success) {
            localStorage.removeItem("inviteToken");
            dispatch(setIsWorkspaceLoaded(false))
            setTimeout(() => {
              navigate("/");
            }, 1500);
          }
        } catch {
          setTimeout(() => {
            navigate("/");
          }, 1500);
        }
      };

      joinWorkspace();
    }
  }, [user, token, navigate, isUserLoaded, dispatch])

  return (
    <div className="invite-loading">
      {joining ? (
        <div style={{padding: "2rem", borderRadius:"13px", border:"var(--border)"}}>
          <h2>Almost there…</h2>
          <p>Setting things up for you</p>
        </div>
      ) : (
        <h2>Preparing invite…</h2>
      )}
    </div>
  );

}

export default InvitePage
