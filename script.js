// Основные переменные Three.js
let scene, camera, renderer, mesh, material, controls;
let currentGeometryType = 'cube';

// Элементы интерфейса
const container = document.getElementById('canvas-holder');
const colorPicker = document.getElementById('colorPicker');
const rotationCheck = document.getElementById('rotationCheck');

// 1. Инициализация 3D сцены
function init3D() {
    // Создаем сцену
    scene = new THREE.Scene();

    // Создаем камеру (угол обзора, соотношение сторон, ближняя и дальняя плоскости отсечения)
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 5);

    // Рендерер с поддержкой сглаживания (antialias)
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Добавляем освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Общий рассеянный свет
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8); // Направленный свет (как солнце)
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00f5d4, 0.3); // Цветной подсвечивающий свет сбоку
    dirLight2.position.set(-5, -5, 2);
    scene.add(dirLight2);

    // Создаем базовый материал
    material = new THREE.MeshStandardMaterial({
        color: colorPicker.value,
        roughness: 0.4,
        metalness: 0.2,
        wireframe: false
    });

    // Создаем объект на сцене
    buildMesh();

    // Контроллеры мыши (вращение, зум)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Плавность вращения
    controls.dampingFactor = 0.05;

    // Запуск цикла анимации
    animate();
}

// 2. Функция создания/смены геометрии
function buildMesh() {
    if (mesh) scene.remove(mesh);

    let geometry;
    if (currentGeometryType === 'cube') {
        geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    } else if (currentGeometryType === 'sphere') {
        geometry = new THREE.SphereGeometry(1, 32, 32);
    } else if (currentGeometryType === 'torus') {
        geometry = new THREE.TorusGeometry(0.7, 0.25, 16, 100);
    }

    // В Three.js точки создаются через другой класс объектов
    if (material.userData.mode === 'points') {
        const pointsMat = new THREE.PointsMaterial({ color: material.color, size: 0.05 });
        mesh = new THREE.Points(geometry, pointsMat);
    } else {
        mesh = new THREE.Mesh(geometry, material);
    }

    scene.add(mesh);
}

// 3. Цикл рендеринга (вызывается ~60 раз в секунду)
function animate() {
    requestAnimationFrame(animate);

    // Автоматическое вращение объекта
    if (rotationCheck.checked && mesh) {
        mesh.rotation.x += 0.005;
        mesh.rotation.y += 0.01;
    }

    controls.update();
    renderer.render(scene, camera);
}

// 4. Интерактивные функции управления из интерфейса

// Смена геометрии
function changeGeometry(type) {
    currentGeometryType = type;
    buildMesh();
}

// Смена режима отображения (Сетка / Сплошной / Точки)
function setMode(mode) {
    material.userData.mode = mode;
    
    if (mode === 'wireframe') {
        material.wireframe = true;
        buildMesh();
    } else if (mode === 'points') {
        buildMesh();
    } else {
        material.wireframe = false;
        buildMesh();
    }
}

// Интеграция с лекционными карточками (демонстрационный скрипт)
function changeStep(stepNumber, modeType) {
    // Переключение активного класса в меню
    document.querySelectorAll('.step-card').forEach((card, idx) => {
        card.classList.toggle('active', idx === stepNumber - 1);
    });

    // Меняем настройки отображения в зависимости от шага рассказа
    if (modeType === 'polygons') {
        setMode('wireframe');
        changeGeometry('cube');
    } else if (modeType === 'shading') {
        setMode('solid');
        material.roughness = 0.1; // Делаем глянцевым для демонстрации бликов света
        material.metalness = 0.8;
    } else if (modeType === 'texture') {
        setMode('solid');
        material.roughness = 0.5;
        material.metalness = 0.1;
        // Для полноценной текстуры нужен внешний файл изображения, 
        // поэтому мы просто меняем форму на сложную (Тор), имитируя готовый объект
        changeGeometry('torus');
    }
}

// Изменение цвета в реальном времени
colorPicker.addEventListener('input', (e) => {
    if (mesh) {
        if (mesh.material.color) {
            mesh.material.color.set(e.target.value);
        }
    }
});

// Отслеживание изменения размеров окна для адаптивности 3D
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// Запуск при загрузке страницы
window.onload = init3D;