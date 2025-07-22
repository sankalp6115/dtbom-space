    let simulationStarted = false;

    window.onload = function () {
      document.body.style.opacity = 1;
      const canvas = document.getElementById("pathCanvas");
      const ctx = canvas.getContext("2d");

      // Set canvas size to match the body width and viewport height
      canvas.width = document.body.scrollWidth;
      canvas.height = window.innerHeight;

      // Update canvas size on window resize to handle dynamic viewport changes
      window.addEventListener("resize", () => {
        canvas.width = document.body.scrollWidth;
        canvas.height = window.innerHeight;
      });

      function getElementCenterCoords(el) {
        const rect = el.getBoundingClientRect();
        // Adjust for scroll position and canvas offset
        const x = rect.left + rect.width / 2 + window.scrollX;
        const y = rect.top + rect.height / 2 + window.scrollY;
        return { x, y };
      }

      const bodies = [
        {
          element: document.querySelector(".sun"),
          color: "orange",
          path: [],
        },
        {
          element: document.querySelector(".earth"),
          color: "greenyellow",
          path: [],
        },
        { element: document.querySelector(".moon"), color: "grey", path: [] },
        {
          element: document.querySelector(".emb-moon"),
          color: "blue",
          path: [],
        },
        {
          element: document.querySelector(".emb-emb-moon1"),
          color: "gold",
          path: [],
        },
        {
          element: document.querySelector(".emb-emb-moon2"),
          color: "red",
          path: [],
        },
      ];

      function updatePath() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings

        bodies.forEach((body) => {
          const { x, y } = getElementCenterCoords(body.element);

          const MAX_TRAIL = trailLength;
          if (showTrails) {
            body.path.push({ x, y });
            if (body.path.length > MAX_TRAIL) {
              body.path.shift();
            }

            ctx.beginPath();
            ctx.strokeStyle = body.color;
            ctx.lineWidth = 3;
            ctx.moveTo(body.path[0].x, body.path[0].y);

            for (let i = 1; i < body.path.length; i++) {
              ctx.lineTo(body.path[i].x, body.path[i].y);
            }

            ctx.stroke();
            ctx.closePath();
          }
        });
      }

      function lockCamera() {
        let target = null;

        if (cameraMode === "sun") target = bodies[0].element;
        else if (cameraMode === "earth") target = bodies[1].element;
        else return; // free mode

        const { x } = getElementCenterCoords(target);
        const scrollX = x - window.innerWidth / 2;

        window.scrollTo({ left: scrollX, behavior: "auto" });
      }

      function animate() {
        if (!simulationStarted) return requestAnimationFrame(animate); // wait
        updatePath();
        lockCamera();
        requestAnimationFrame(animate);
      }

      animate();
    };

    const burger = document.getElementById("burger");
    const panel = document.getElementById("panel-content");
    burger.onclick = () => {
      panel.style.display =
        panel.style.display === "block" ? "none" : "block";
    };

    // Control panel states
    let cameraMode = "free"; // 'sun', 'earth', or 'free'
    let showTrails = true;
    let trailLength = 300;
    let pauseSun = false;

    // DOM Elements
    const camSun = document.getElementById("cam-sun");
    const camEarth = document.getElementById("cam-earth");
    const camFree = document.getElementById("cam-free");
    const toggleTrails = document.getElementById("toggle-trails");
    const trailRange = document.getElementById("trail-length");
    const trailVal = document.getElementById("trail-value");
    const pauseSunCheckbox = document.getElementById("pause-sun");

    // Listeners
    camSun.onchange = () => (cameraMode = "sun");
    camEarth.onchange = () => (cameraMode = "earth");
    camFree.onchange = () => (cameraMode = "free");

    toggleTrails.onchange = () => (showTrails = toggleTrails.checked);

    trailRange.oninput = () => {
      trailLength = parseInt(trailRange.value);
      trailVal.textContent = trailLength;
    };

    pauseSunCheckbox.onchange = () => {
      pauseSun = pauseSunCheckbox.checked;
      document.querySelector(".sun").style.animationPlayState = pauseSun
        ? "paused"
        : "running";
    };

    document.addEventListener("DOMContentLoaded", () => {
      camSun.checked = true; // set it checked
      camSun.dispatchEvent(new Event("change"));
    });

    document.getElementById("start-btn").onclick = () => {
      simulationStarted = true;
      document.getElementById("start-overlay").style.display = "none";

      // Resume sun animation if not paused
      if (!pauseSun)
        document.querySelector(".sun").style.animationPlayState = "running";
    };

    document.querySelector(".sun").style.animationPlayState = "paused";

    // Mobile Warning
    if (window.innerWidth < 800) {
      document.getElementById("mobile-warning").style.display = "flex";
    }