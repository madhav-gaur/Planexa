import { NavLink } from "react-router-dom"
import Content from "./Content"

const Home = () => {
    return (
        <div className="Home-wrapper">
            <div>
                <div>
                    <NavLink to='projects'>
                        <p>Projects</p>
                    </NavLink>
                </div>
                <div>
                    <Content />
                </div>
            </div>
        </div>
    )
}

export default Home
