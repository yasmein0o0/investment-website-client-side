import "../styles/header.scss"


export function Header() {
    return (
        <header id="header">
            <div id="logo">
                HatHu
            </div>

            <div id="search-container">
                <input type="search" id="search" name="search" placeholder="Search here...."  />
                <img src="" alt="" id="search-icon" />
            </div>

            <div id="menu">
            <li className="menu-item" id="home">home</li>
            <li className="menu-item" id="portfolio">portfolio</li>
            <li className="menu-item" id="news">news</li>
            <li className="menu-item" id="notefications">notefications</li>
            <li className="menu-item" id="learn">learn</li>
            <li className="menu-item" id="blog">blog</li>
            <li className="menu-item" id="account">account</li>
            </div>
            
        </header>
    )
}