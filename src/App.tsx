import { useState } from 'react';
import { PhaserGame } from './PhaserGame';

function App()
{
    const [sceneLabel, setSceneLabel] = useState('Chargement...');

    const currentScene = (scene: Phaser.Scene) => {
        setSceneLabel(scene.scene.key);
    }

    return (
        <div id="app" className="appShell">
            <div className="gameFrame">
                <PhaserGame currentActiveScene={currentScene} />
            </div>
            <div className="gameCaption">
                <h1>Aventure des Maths - CP</h1>
                <p>Compter, additionner et soustraire avec des niveaux progressifs.</p>
                <p className="sceneInfo">Scene active: {sceneLabel}</p>
            </div>
        </div>
    )
}

export default App
