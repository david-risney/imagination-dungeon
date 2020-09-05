import {Point} from "./point.js";
import {GameMapViewControlModeTest, GameMapViewControlModePlacePiece} from "./gamemapviewcontrolmode.js";

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

export {PlacePieceCard};