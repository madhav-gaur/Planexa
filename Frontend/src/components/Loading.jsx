import "../components/Styles/Loading.css"

const Loading = () => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
    }
    return (
        <div className='loader-wrapper'>
            < div className='loader'>
            </div >
            <p>Loading...</p>
        </div >
    )
}

export default Loading
