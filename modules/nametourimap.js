class NameToUriMap {
    _uriMap = {};
    constructor(uriMap) {
        this._uriMap = uriMap;
    }

    Map(name) {
        const relativeUri = this._uriMap[name];
        if (!relativeUri) {
            console.error("Failed to find name " + name + " in map.");
            throw new Error("Failed to find name " + name + " in map.");
        }
        const uri = "./images/" + relativeUri;

        return uri;
    }
}

export {NameToUriMap};