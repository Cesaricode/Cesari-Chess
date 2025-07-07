export function saveGameState() {
    // Only save for bot games
    if (!this._remotePlayer.isBot)
        return;
    const saveData = {
        fen: FEN.serializeFullFEN(this._game),
        moveHistory: this._game.moveHistory,
        localColor: this._localPlayer.color,
        botType: this._remotePlayer.name, // or some identifier
        botColor: this._remotePlayer.color,
    };
    localStorage.setItem("cesariChessSave", JSON.stringify(saveData));
}
;
