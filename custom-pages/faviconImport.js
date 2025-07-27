export function faviconSet(){
    const title = document.title;
    console.log(title);

    //<link rel="shortcut icon" href="favicon.ico" type="image/x-icon">
    const link = document.createElement("link");
    link.setAttribute("rel", "icon");
    link.setAttribute("href", "Images/icon.png");
    link.setAttribute("type", "image/x-icon");

    document.head.appendChild(link);
}