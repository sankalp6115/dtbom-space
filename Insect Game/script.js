const img = 'https://png.pngtree.com/png-clipart/20240810/original/pngtree-small-insect-ladybug-png-image_15739904.png';

function generateInsect(){
    //Insect initialisation
    const insect = document.createElement('img');
    insect.src = img;
    insect.alt = 'Insect';
    insect.style.position = 'absolute';
    insect.style.width = '100px';
    const dimension = insect.height;
    insect.style.cursor = 'pointer';
    insect.style.top = (Math.random() * window.innerHeight) + 'px';
    insect.style.left = (Math.random() * window.innerWidth) + 'px';
    document.body.appendChild(insect);
    insect.addEventListener('click', function() {
            this.remove();
            generateInsect();
            generateInsect();
    });
}

generateInsect();