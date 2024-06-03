export class StringHumanizer extends String {
    capitalizeFirstLetter(): StringHumanizer {
        const transformed = this.charAt(0).toUpperCase() + this.slice(1);
        return new StringHumanizer(transformed);
    }

    lowerCaseExceptFirst(): StringHumanizer {
        const transformed = this.charAt(0) + this.slice(1).toLowerCase();
        return new StringHumanizer(transformed);
    }

    camelCaseToSpaces(): StringHumanizer {
        const camelMatch = /([A-Z])/g;
        return new StringHumanizer(this.replace(camelMatch, " $1"));
    }

    underscoresToSpaces(): StringHumanizer {
        const camelMatch = /_/g;
        return new StringHumanizer(this.replace(camelMatch, " "));
    }

    humanize(): string {
        return this.camelCaseToSpaces()
            .underscoresToSpaces()
            .capitalizeFirstLetter()
            .lowerCaseExceptFirst()
            .toString();
    }
}
