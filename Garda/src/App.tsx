import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import './App.css';

function App() {
  const threeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!threeRef.current) return;

    // Create the scene
    const scene = new THREE.Scene();

    // Set up the camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Set up the renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    threeRef.current.appendChild(renderer.domElement);

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Load the font
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font: Font) => {
      // Create text geometry for 'A'
      const textGeometryA = new TextGeometry('A', {
        font: font,
        size: 1,
        height: 0.2,
      });

      // Alphabet Material
      const alphabetMaterial = new THREE.MeshStandardMaterial({
        color: 0xC3B091, // Brownish khaki color
        roughness: 0.5,
        metalness: 0.5,
      });
      const textMeshA = new THREE.Mesh(textGeometryA, alphabetMaterial);
      textMeshA.position.x = -2; // Position on the left side
      scene.add(textMeshA);

      // Create text geometry for '8'
      const textGeometry8 = new TextGeometry('8', {
        font: font,
        size: 1,
        height: 0.1,
      });

      // Digit Material
      const digitMaterial = new THREE.MeshStandardMaterial({
        color: 0x800080, // Purple color
        roughness: 0.5,
        metalness: 0.5,
      });
      const textMesh8 = new THREE.Mesh(textGeometry8, digitMaterial);
      textMesh8.position.x = 1; // Position closer to the cube
      scene.add(textMesh8);

      // Create a glowing cube at the center with white emissive color
      const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5); // Smaller cube
      const cubeMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xffffff, // White emissive color
        emissiveIntensity: 5, // Increase emissive intensity
      });
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
      scene.add(cube);

      // Add a point light at the cube's position with white color
      const pointLight = new THREE.PointLight(0xffffff, 10, 500); // Increase distance and change color to white
      pointLight.position.copy(cube.position);
      scene.add(pointLight);

      // Add ambient light with intensity 0.468
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.468); // White ambient light with intensity 0.468
      scene.add(ambientLight);

      // Set up post-processing for bloom effect
      const composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        2.0, // Increase strength
        0.4, // Radius
        0.85 // Threshold
      );
      composer.addPass(bloomPass);

      // Handle keydown events for interactivity
      const handleKeyDown = (event: KeyboardEvent) => {
        switch (event.key) {
          case 'w':
            cube.position.y += 0.1;
            break;
          case 's':
            cube.position.y -= 0.1;
            break;
          case 'a':
            camera.position.x += 0.1;
            break;
          case 'd':
            camera.position.x -= 0.1;
            break;
        }
        // Update light position
        pointLight.position.copy(cube.position);
      };
      window.addEventListener('keydown', handleKeyDown);

      // Render the scene
      const animate = () => {
        requestAnimationFrame(animate);
        composer.render();
      };
      animate();

      // Clean up on component unmount
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('keydown', handleKeyDown);
        if (threeRef.current) {
          threeRef.current.removeChild(renderer.domElement);
        }
      };
    });
  }, []);

  return (
    <div ref={threeRef} style={{ width: '100%', height: '100vh', margin: 0, padding: 0 }}></div>
  );
}

export default App;