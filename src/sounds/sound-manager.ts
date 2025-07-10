export class SoundManager {

    private _isMuted = false;
    private _userHasInteracted = false;

    public constructor() {

    }


    // Getters/Setters


    public get isMuted(): boolean {
        return this._isMuted;
    }

    public set isMuted(value: boolean) {
        this._isMuted = value;
    }

    public get userHasInteracted() {
        return this._userHasInteracted;
    }

    public set userHasInteracted(value) {
        this._userHasInteracted = value;
    }


    // Play Sound Methods


    public playMoveSound(): void {
        if (!this._isMuted && this._userHasInteracted) {
            const moveSound: HTMLAudioElement = new Audio("sounds/move.mp3");
            moveSound.play();
        }
    }

    public playCaptureSound(): void {
        if (!this._isMuted && this._userHasInteracted) {
            const captureSound: HTMLAudioElement = new Audio("sounds/capture.mp3");
            captureSound.play();
        }
    }

    public playGenericNotifySound(): void {
        if (!this._isMuted && this._userHasInteracted) {
            const genericNotifySound: HTMLAudioElement = new Audio("sounds/genericnotify.mp3");
            genericNotifySound.play();
        }
    }
}



