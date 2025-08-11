export function setFavicon(){
    const link = document.createElement("link");
    link.rel = "shortcut icon";
    link.href = "https://i.ibb.co/99Sndx5j/icon.png";
    link.type = "image/x-icon";
    document.head.appendChild(link);
}