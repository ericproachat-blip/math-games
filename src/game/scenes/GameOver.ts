import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { MathOperation, OPERATION_LABELS } from '../scoreHistory';

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameOverText : Phaser.GameObjects.Text;
    scoreText: Phaser.GameObjects.Text;
    replayButtonText: Phaser.GameObjects.Text;
    replayButtonBg: Phaser.GameObjects.Rectangle;
    homeButtonText: Phaser.GameObjects.Text;
    homeButtonBg: Phaser.GameObjects.Rectangle;

    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0xf1fff3);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.2);

        const finalScore = this.registry.get('finalScore') ?? 0;
        const finalLevel = this.registry.get('finalLevel') ?? 1;
        const finalOperation = (this.registry.get('finalOperation') as MathOperation | undefined) ?? 'addition';
        const maxQuestions = this.registry.get('maxQuestions') ?? 12;

        this.gameOverText = this.add.text(512, 248, 'Fin de mission!', {
            fontFamily: 'Trebuchet MS', fontSize: 68, color: '#1f7a1f',
            stroke: '#ffffff', strokeThickness: 10,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.scoreText = this.add.text(
            512,
            380,
            `Score: ${finalScore}\nOperation: ${OPERATION_LABELS[finalOperation]}\nNiveau: ${finalLevel}\nQuestions: ${maxQuestions}`,
            {
                fontFamily: 'Trebuchet MS',
                fontSize: 36,
                color: '#1d3557',
                stroke: '#ffffff',
                strokeThickness: 8,
                align: 'center'
            }
        ).setOrigin(0.5);

        this.replayButtonBg = this.add.rectangle(382, 596, 280, 70, 0xffd166)
            .setStrokeStyle(4, 0x0d3b66)
            .setInteractive({ useHandCursor: true });
        this.replayButtonText = this.add.text(382, 596, 'Rejouer', {
            fontFamily: 'Trebuchet MS',
            fontSize: 36,
            color: '#0d3b66',
            stroke: '#ffffff',
            strokeThickness: 8
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.homeButtonBg = this.add.rectangle(642, 596, 280, 70, 0x8ecae6)
            .setStrokeStyle(4, 0x0d3b66)
            .setInteractive({ useHandCursor: true });
        this.homeButtonText = this.add.text(642, 596, 'Accueil', {
            fontFamily: 'Trebuchet MS',
            fontSize: 36,
            color: '#0d3b66',
            stroke: '#ffffff',
            strokeThickness: 8
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const replay = () => {
            this.scene.start('Game', {
                operation: finalOperation,
                level: finalLevel
            });
        };

        const goHome = () => this.scene.start('MainMenu');

        this.replayButtonBg.on('pointerdown', replay);
        this.replayButtonText.on('pointerdown', replay);
        this.homeButtonBg.on('pointerdown', goHome);
        this.homeButtonText.on('pointerdown', goHome);
        this.input.keyboard?.on('keydown-SPACE', replay);
        this.input.keyboard?.on('keydown-ESC', goHome);
        
        EventBus.emit('current-scene-ready', this);
    }
}
