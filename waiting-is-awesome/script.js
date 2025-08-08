const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const loader = entry.target;

    if (entry.isIntersecting) {
      loader.classList.remove('paused');
    } else {
      loader.classList.add('paused');
    }
  });
}, {
  root: null, // viewport
  threshold: 0.6 // adjust as needed
});

// Observe all .loader elements
document.querySelectorAll('.loader').forEach(loader => {
  observer.observe(loader);
});


//About section typewriter animation
const text = "Free Library of Awesome Loaders!";
const about = document.querySelector(".free-loader");
let i=0;
    
    function updateText(){
        if(i < text.length){
            about.textContent += text.charAt(i);
            i++
        }
        else{
            clearInterval(interval);
        }
    }
    const interval = setInterval(updateText, 50);
    updateText();


const loaders = document.querySelectorAll("section.loaders a");
loaders.forEach(loader => {
  loader.href = "https://github.com/sankalp6115/dtbom-space/tree/main/waiting-is-awesome/Loaders_for_Website";
});