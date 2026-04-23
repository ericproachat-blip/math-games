import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';
import { getScoreHistory, MathOperation, OPERATION_LABELS } from '../scoreHistory';

interface OperationButton {
    operation: MathOperation;
    background: GameObjects.Rectangle;
    label: GameObjects.Text;
}

interface LevelButton {
    level: number;
    background: GameObjects.Rectangle;
    label: GameObjects.Text;
}

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    title: GameObjects.Text;
    subtitle: GameObjects.Text;
    operationHint: GameObjects.Text;
    levelHint: GameObjects.Text;
    historyTitle: GameObjects.Text;
    historyText: GameObjects.Text;
    startButtonBg: GameObjects.Rectangle;
    startButtonText: GameObjects.Text;
    selectedOperation: MathOperation | null;
    selectedLevel: number | null;
    operationButtons: OperationButton[];
    levelButtons: LevelButton[];

    constructor ()
    {
        super('MainMenu');
        this.selectedOperation = null;
        this.selectedLevel = null;
        this.operationButtons = [];
        this.levelButtons = [];
    }

    create ()
    {
        this.selectedOperation = null;
        this.selectedLevel = null;
        this.operationButtons = [];
        this.levelButtons = [];

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.65);

        this.title = this.add.text(512, 96, 'Aventure des Maths', {
            fontFamily: 'Trebuchet MS', fontSize: 52, color: '#ffffff',
            stroke: '#0d3b66', strokeThickness: 10,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.subtitle = this.add.text(512, 148, 'Choisis une operation puis un niveau (1 a 5)', {
            fontFamily: 'Trebuchet MS', fontSize: 26, color: '#073b4c',
            stroke: '#ffffff', strokeThickness: 5,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.operationHint = this.add.text(512, 210, '1) Operation', {
            fontFamily: 'Trebuchet MS',
            fontSize: 28,
            color: '#0d3b66'
        }).setOrigin(0.5).setDepth(100);

        this.createOperationButtons();

        this.levelHint = this.add.text(512, 350, '2) Niveau', {
            fontFamily: 'Trebuchet MS',
            fontSize: 28,
            color: '#0d3b66'
        }).setOrigin(0.5).setDepth(100);

        this.createLevelButtons();

        this.historyTitle = this.add.text(512, 474, 'Historique (20 derniers scores)', {
            fontFamily: 'Trebuchet MS',
            fontSize: 24,
            color: '#1d3557',
            stroke: '#ffffff',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.historyText = this.add.text(512, 560, '', {
            fontFamily: 'Trebuchet MS',
            fontSize: 22,
            color: '#1d3557',
            align: 'center'
        }).setOrigin(0.5);
        this.refreshHistory();

        this.startButtonBg = this.add.rectangle(512, 710, 420, 74, 0xffd166)
            .setStrokeStyle(4, 0x0d3b66)
            .setDepth(100);

        this.startButtonText = this.add.text(512, 710, 'Commencer (20 exercices)', {
            fontFamily: 'Trebuchet MS',
            fontSize: 32,
            color: '#0d3b66',
            align: 'center'
        }).setOrigin(0.5).setDepth(101);

        this.startButtonBg.setInteractive({ useHandCursor: true });
        this.startButtonText.setInteractive({ useHandCursor: true });

        this.startButtonBg.on('pointerdown', () => this.startGame());
        this.startButtonText.on('pointerdown', () => this.startGame());
        this.startButtonBg.on('pointerover', () => {
            this.startButtonBg.setFillStyle(0xffca3a);
            this.startButtonText.setScale(1.05);
        });
        this.startButtonBg.on('pointerout', () => {
            this.refreshStartButton();
            this.startButtonText.setScale(1);
        });

        this.input.keyboard?.on('keydown-ENTER', () => this.startGame());
        this.refreshStartButton();

        EventBus.emit('current-scene-ready', this);
    }

    createOperationButtons ()
    {
        const operations: MathOperation[] = ['addition', 'soustraction', 'multiplication', 'division'];
        const xStart = 196;
        const gap = 210;

        operations.forEach((operation, index) => {
            const x = xStart + (index * gap);
            const background = this.add.rectangle(x, 270, 188, 66, 0xffd166)
                .setStrokeStyle(4, 0x0d3b66)
                .setInteractive({ useHandCursor: true });
            const label = this.add.text(x, 270, OPERATION_LABELS[operation], {
                fontFamily: 'Trebuchet MS',
                fontSize: 23,
                color: '#0d3b66'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            const pickOperation = () => {
                this.selectedOperation = operation;
                this.selectedLevel = null;
                this.refreshOperationButtons();
                this.refreshLevelButtons();
                this.refreshStartButton();
            };

            background.on('pointerdown', pickOperation);
            label.on('pointerdown', pickOperation);

            this.operationButtons.push({ operation, background, label });
        });

        this.refreshOperationButtons();
    }

    createLevelButtons ()
    {
        const xStart = 292;
        const gap = 110;

        for (let level = 1; level <= 5; level += 1) {
            const x = xStart + ((level - 1) * gap);
            const background = this.add.rectangle(x, 410, 80, 62, 0xffffff)
                .setStrokeStyle(4, 0x0d3b66)
                .setInteractive({ useHandCursor: true });
            const label = this.add.text(x, 410, `${level}`, {
                fontFamily: 'Trebuchet MS',
                fontSize: 34,
                color: '#0d3b66'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            const pickLevel = () => {
                if (!this.selectedOperation) {
                    return;
                }

                this.selectedLevel = level;
                this.refreshLevelButtons();
                this.refreshStartButton();
            };

            background.on('pointerdown', pickLevel);
            label.on('pointerdown', pickLevel);

            this.levelButtons.push({ level, background, label });
        }

        this.refreshLevelButtons();
    }

    refreshOperationButtons ()
    {
        this.operationButtons.forEach((button) => {
            const isSelected = button.operation === this.selectedOperation;
            button.background.setFillStyle(isSelected ? 0x8ecae6 : 0xffd166);
            button.label.setColor(isSelected ? '#073b4c' : '#0d3b66');
        });
    }

    refreshLevelButtons ()
    {
        const operationSelected = !!this.selectedOperation;

        this.levelButtons.forEach((button) => {
            const isSelected = button.level === this.selectedLevel;
            button.background.setFillStyle(!operationSelected ? 0xdfe8f1 : (isSelected ? 0x8ecae6 : 0xffffff));
            button.label.setColor(operationSelected ? '#0d3b66' : '#6b7280');
        });
    }

    refreshStartButton ()
    {
        const canStart = this.selectedOperation !== null && this.selectedLevel !== null;
        this.startButtonBg.setFillStyle(canStart ? 0xffd166 : 0xd9d9d9);
        this.startButtonText.setColor(canStart ? '#0d3b66' : '#6b7280');
    }

    refreshHistory ()
    {
        const history = getScoreHistory();
        if (history.length === 0) {
            this.historyText.setText('Aucune partie enregistree pour le moment.');
            return;
        }

        const lines = history.slice(0, 5).map((entry) => {
            const date = new Date(entry.createdAt);
            const dateLabel = Number.isNaN(date.getTime())
                ? entry.createdAt
                : date.toLocaleDateString('fr-FR');
            return `${dateLabel} | ${OPERATION_LABELS[entry.operation]} | Niv ${entry.level} | Score ${entry.score}/${entry.totalQuestions * 10}`;
        });

        this.historyText.setText(lines.join('\n'));
    }

    startGame ()
    {
        if (!this.selectedOperation || !this.selectedLevel) {
            return;
        }

        this.scene.start('Game', {
            operation: this.selectedOperation,
            level: this.selectedLevel
        });
    }
}
