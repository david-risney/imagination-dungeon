import {Point} from "./point.js";
import {GameMapViewControlModeTest, GameMapViewControlModePlacePiece, GameMapViewControlModeMoveCharacter} from "./gamemapviewcontrolmode.js";

class PlacePieceCard {
    m_gameMapView;
    m_piece;

    constructor(view, piece) {
        this.m_gameMapView = view;
        this.m_piece = piece;
    }

    Invoke() {
        this.m_gameMapView.GameMapOverlay = this.m_piece;
        this.m_gameMapView.SetGameMapOverlayOffset(new Point(0, 0));
        this.m_gameMapView.PushControlMode(new GameMapViewControlModePlacePiece());
    }

    Clone() {
        return new PlacePieceCard(this.m_gameMapView, m_piece.Clone());
    }
}

class MoveCard {
    m_gameMapView;
    m_character;

    constructor(view, character) {
        this.m_gameMapView = view;
        this.m_character = character;
    }

    Invoke() {
        this.m_gameMapView.PushControlMode(new GameMapViewControlModeMoveCharacter(this.m_character));
    }

    Clone() {
        return new MoveCard(this.m_gameMapView, this.m_character);
    }
}

export {PlacePieceCard, MoveCard};