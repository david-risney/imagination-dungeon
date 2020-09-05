class Spot {
    Traversable = false;
    Name = "";

    constructor(traversable, name) {
        this.Traversable = traversable;
        this.Name = name;
    }

    toString() {
        return "{Spot " + this.Name + "}";
    }
}
Spot.Empty = new Spot(false, "empty");
Spot.Wall = new Spot(false, "wall");
Spot.Floor = new Spot(true, "floor");

export {Spot};