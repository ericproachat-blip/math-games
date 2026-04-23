import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import { addScoreHistory, MathOperation, OPERATION_LABELS } from '../scoreHistory';

interface MathQuestion {
    text: string;
    correctAnswer: number;
    choices: number[];
}

interface ChoiceButton {
    container: Phaser.GameObjects.Container;
    background: Phaser.GameObjects.Rectangle;
    label: Phaser.GameObjects.Text;
    value: number;
}

interface GameStartData {
    operation?: MathOperation;
    level?: number;
}

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    titleText: Phaser.GameObjects.Text;
    operationText: Phaser.GameObjects.Text;
    levelText: Phaser.GameObjects.Text;
    scoreText: Phaser.GameObjects.Text;
    progressText: Phaser.GameObjects.Text;
    questionText: Phaser.GameObjects.Text;
    feedbackText: Phaser.GameObjects.Text;
    homeButtonBg: Phaser.GameObjects.Rectangle;
    homeButtonText: Phaser.GameObjects.Text;
    validateButtonBg: Phaser.GameObjects.Rectangle;
    validateButtonText: Phaser.GameObjects.Text;

    operation: MathOperation;
    level: number;
    score: number;
    askedQuestions: number;
    maxQuestions: number;
    currentQuestion: MathQuestion | null;
    isAnswerLocked: boolean;
    selectedAnswer: number | null;
    selectedChoiceButton: ChoiceButton | null;
    choiceButtons: ChoiceButton[];

    constructor ()
    {
        super('Game');

        this.operation = 'addition';
        this.level = 1;
        this.score = 0;
        this.askedQuestions = 0;
        this.maxQuestions = 20;
        this.currentQuestion = null;
        this.isAnswerLocked = false;
        this.selectedAnswer = null;
        this.selectedChoiceButton = null;
        this.selectedAnswer = null;
        this.selectedChoiceButton = null;
        this.choiceButtons = [];
    }

    create (data: GameStartData)
    {
        this.operation = data.operation ?? 'addition';
        this.level = Phaser.Math.Clamp(data.level ?? 1, 1, 5);
        this.score = 0;
        this.askedQuestions = 0;
        this.currentQuestion = null;
        this.isAnswerLocked = false;
        this.choiceButtons = [];

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0xe9f9ff);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.23);

        this.add.rectangle(512, 384, 900, 640, 0xffffff, 0.85)
            .setStrokeStyle(5, 0x0d3b66);

        this.titleText = this.add.text(512, 100, 'Mission Maths - 20 exercices', {
            fontFamily: 'Trebuchet MS',
            fontSize: 46,
            color: '#0d3b66',
            stroke: '#ffffff',
            strokeThickness: 8
        }).setOrigin(0.5);

        this.operationText = this.add.text(512, 156, '', {
            fontFamily: 'Trebuchet MS',
            fontSize: 28,
            color: '#073b4c'
        }).setOrigin(0.5);

        this.levelText = this.add.text(90, 170, '', {
            fontFamily: 'Trebuchet MS',
            fontSize: 30,
            color: '#073b4c'
        }).setOrigin(0, 0.5);

        this.scoreText = this.add.text(934, 170, '', {
            fontFamily: 'Trebuchet MS',
            fontSize: 30,
            color: '#073b4c'
        }).setOrigin(1, 0.5);

        this.progressText = this.add.text(512, 214, '', {
            fontFamily: 'Trebuchet MS',
            fontSize: 26,
            color: '#1d3557'
        }).setOrigin(0.5);

        this.questionText = this.add.text(512, 305, '', {
            fontFamily: 'Trebuchet MS',
            fontSize: 64,
            color: '#1d3557',
            stroke: '#ffffff',
            strokeThickness: 10,
            align: 'center'
        }).setOrigin(0.5);

        this.feedbackText = this.add.text(512, 610, '', {
            fontFamily: 'Trebuchet MS',
            fontSize: 36,
            color: '#2f4858',
            stroke: '#ffffff',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.homeButtonBg = this.add.rectangle(118, 64, 176, 52, 0xffd166)
            .setStrokeStyle(3, 0x0d3b66)
            .setInteractive({ useHandCursor: true });
        this.homeButtonText = this.add.text(118, 64, 'Accueil', {
            fontFamily: 'Trebuchet MS',
            fontSize: 30,
            color: '#0d3b66'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const goHome = () => this.scene.start('MainMenu');
        this.homeButtonBg.on('pointerdown', goHome);
        this.homeButtonText.on('pointerdown', goHome);

        this.createChoiceButtons();
        this.refreshHud();
        this.prepareNextQuestion();

        EventBus.emit('current-scene-ready', this);
    }

    createChoiceButtons ()
    {
        const y = 450;
        const xPositions = [250, 512, 774];

        xPositions.forEach((x) => {
            const background = this.add.rectangle(0, 0, 220, 110, 0xffd166)
                .setStrokeStyle(4, 0x0d3b66);
            const label = this.add.text(0, 0, '?', {
                fontFamily: 'Trebuchet MS',
                fontSize: 54,
                color: '#0d3b66'
            }).setOrigin(0.5);

            const container = this.add.container(x, y, [background, label]);
            container.setSize(220, 110);
            background.setInteractive(new Phaser.Geom.Rectangle(-110, -55, 220, 110), Phaser.Geom.Rectangle.Contains);
            label.setInteractive({ useHandCursor: true });

            const hoverIn = () => {
                if (!this.isAnswerLocked) {
                    if (this.selectedChoiceButton === choiceButton) {
                        background.setFillStyle(0x8ecae6);
                    } else {
                        background.setFillStyle(0xffca3a);
                    }
                }
            };

            const hoverOut = () => {
                if (!this.isAnswerLocked) {
                    if (this.selectedChoiceButton === choiceButton) {
                        background.setFillStyle(0x8ecae6);
                    } else {
                        background.setFillStyle(0xffd166);
                    }
                }
            };

            const choiceButton: ChoiceButton = {
                container,
                background,
                label,
                value: 0
            };

            background.on('pointerover', hoverIn);
            background.on('pointerout', hoverOut);
            label.on('pointerover', hoverIn);
            label.on('pointerout', hoverOut);

            const select = () => {
                this.selectChoice(choiceButton);
            };

            background.on('pointerdown', select);
            label.on('pointerdown', select);

            this.choiceButtons.push(choiceButton);
        });

        this.validateButtonBg = this.add.rectangle(512, 560, 260, 78, 0xd9d9d9)
            .setStrokeStyle(4, 0x0d3b66)
            .setInteractive({ useHandCursor: true });
        this.validateButtonText = this.add.text(512, 560, 'Valider', {
            fontFamily: 'Trebuchet MS',
            fontSize: 42,
            color: '#6b7280'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const validate = () => this.handleValidate();
        this.validateButtonBg.on('pointerdown', validate);
        this.validateButtonText.on('pointerdown', validate);
    }

    refreshHud ()
    {
        this.operationText.setText(`Operation: ${OPERATION_LABELS[this.operation]}`);
        this.levelText.setText(`Niveau ${this.level}`);
        this.scoreText.setText(`Score ${this.score}`);
        this.progressText.setText(`Question ${this.askedQuestions + 1}/${this.maxQuestions}`);
    }

    prepareNextQuestion ()
    {
        this.isAnswerLocked = false;
        this.selectedAnswer = null;
        this.selectedChoiceButton = null;
        this.feedbackText.setText('Choisis une reponse puis clique sur Valider.');
        this.feedbackText.setColor('#2f4858');

        this.currentQuestion = this.generateQuestion(this.operation, this.level);
        this.questionText.setText(this.currentQuestion.text);

        this.choiceButtons.forEach((button, index) => {
            const choiceValue = this.currentQuestion ? this.currentQuestion.choices[index] : 0;
            button.value = choiceValue;
            button.label.setText(`${choiceValue}`);
            button.background.setFillStyle(0xffd166);
        });

        this.refreshValidateButton();
        this.refreshHud();
    }

    selectChoice (choiceButton: ChoiceButton)
    {
        if (this.isAnswerLocked) {
            return;
        }

        this.selectedChoiceButton = choiceButton;
        this.selectedAnswer = choiceButton.value;

        this.choiceButtons.forEach((button) => {
            button.background.setFillStyle(button === choiceButton ? 0x8ecae6 : 0xffd166);
        });

        this.feedbackText.setText('Reponse selectionnee. Clique sur Valider.');
        this.feedbackText.setColor('#2f4858');
        this.refreshValidateButton();
    }

    refreshValidateButton ()
    {
        const canValidate = !this.isAnswerLocked && this.selectedAnswer !== null;
        this.validateButtonBg.setFillStyle(canValidate ? 0xffd166 : 0xd9d9d9);
        this.validateButtonText.setColor(canValidate ? '#0d3b66' : '#6b7280');
    }

    generateQuestion (operation: MathOperation, level: number): MathQuestion
    {
        let a = 0;
        let b = 0;
        let text = '';
        let correctAnswer = 0;

        if (operation === 'addition') {
            const max = [10, 20, 50, 100, 150][level - 1];
            a = Phaser.Math.Between(1, max);
            b = Phaser.Math.Between(1, max);
            text = `${a} + ${b} = ?`;
            correctAnswer = a + b;
        } else if (operation === 'soustraction') {
            const max = [10, 20, 50, 100, 150][level - 1];
            a = Phaser.Math.Between(2, max);
            b = Phaser.Math.Between(1, a - 1);
            text = `${a} - ${b} = ?`;
            correctAnswer = a - b;
        } else if (operation === 'multiplication') {
            const max = [5, 8, 10, 12, 15][level - 1];
            a = Phaser.Math.Between(1, max);
            b = Phaser.Math.Between(1, max);
            text = `${a} x ${b} = ?`;
            correctAnswer = a * b;
        } else {
            const divisorMax = [5, 8, 10, 12, 15][level - 1];
            b = Phaser.Math.Between(1, divisorMax);
            correctAnswer = Phaser.Math.Between(1, divisorMax);
            a = b * correctAnswer;
            text = `${a} / ${b} = ?`;
        }

        const choices = this.buildChoices(correctAnswer);
        return { text, correctAnswer, choices };
    }

    buildChoices (correctAnswer: number): number[]
    {
        const values = new Set<number>();
        values.add(correctAnswer);

        while (values.size < 3) {
            const delta = Phaser.Math.Between(1, Math.max(3, Math.floor(correctAnswer * 0.2) + 2));
            const sign = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
            const option = Math.max(0, correctAnswer + delta * sign);
            values.add(option);
        }

        return Phaser.Utils.Array.Shuffle([...values]);
    }

    handleValidate ()
    {
        if (!this.currentQuestion || this.isAnswerLocked || this.selectedAnswer === null) {
            return;
        }

        this.isAnswerLocked = true;
        this.refreshValidateButton();
        const selectedAnswer = this.selectedAnswer;
        const isCorrect = selectedAnswer === this.currentQuestion.correctAnswer;

        if (isCorrect) {
            this.score += 10 + (this.level * 3);
            this.feedbackText.setText('Bravo! Bonne reponse!');
            this.feedbackText.setColor('#1f7a1f');
        } else {
            this.feedbackText.setText(`Pas encore. Reponse: ${this.currentQuestion.correctAnswer}`);
            this.feedbackText.setColor('#8b1e3f');
        }

        this.askedQuestions += 1;

        if (this.askedQuestions >= this.maxQuestions) {
            this.time.delayedCall(1100, () => this.finishGame());
            return;
        }

        this.time.delayedCall(1000, () => this.prepareNextQuestion());
    }

    finishGame ()
    {
        addScoreHistory({
            operation: this.operation,
            level: this.level,
            score: this.score,
            totalQuestions: this.maxQuestions,
            createdAt: new Date().toISOString()
        });

        this.registry.set('finalScore', this.score);
        this.registry.set('finalLevel', this.level);
        this.registry.set('finalOperation', this.operation);
        this.registry.set('maxQuestions', this.maxQuestions);
        this.scene.start('GameOver');
    }
}
