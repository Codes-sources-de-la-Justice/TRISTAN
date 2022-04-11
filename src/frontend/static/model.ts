import { ElementDefinition } from "cytoscape";

// Victime, mis en cause, témoin, autres.
export enum PersonRole {
  Victim = "VIC",
  Indictee = "MEC",
  Witness = "TEM",
  Other = "AUT",
}
type XMLLeafWithAttrs<Id, Ref, TextType> = {
  "@id": Id;
  "@ref": Ref;
  "#text": TextType;
};

type LawArticle = {
  Valeur: string;
  Lien: string;
};

type JudgeQualification = {
  Lieux: { Lieu: string }[];
  Dates: { Date: string }[];
  Explication: string;
  Articles_Prevus: LawArticle[];
  Articles_Reprimes: LawArticle[];
  Circonstances?: string;
  Victimes: string[];
};

type UTCDate = {
  "@utc": string;
  "#text": string;
};

export type Fact = {
  Nom_Region: string;
  Nature_Lieu: XMLLeafWithAttrs<1083, "natures_lieux", string>;
  Qualification: "DELIT" | "CRIME";
  Pays: XMLLeafWithAttrs<99160, "pays", string>;

  Recidive: boolean;
  Complicite: boolean;

  Libelle: string;
  Natinf: number;

  Libelle_Magistrat: JudgeQualification;

  Code_Postal_Commune: number;
  Commune: string;
  Code_Insee_Commune: string;
  Nom_Departement: string;
  Localisation: string;
  GpsX: number;
  GpsY: number;

  Id_Fait: number;
  Global_Id: number;

  Periode_Affaire_Debut: UTCDate;
  Periode_Affaire_Fin: UTCDate;
};

type Country = XMLLeafWithAttrs<99160, "pays", string>;
type ISOCode = {
  "@codeiso": string; // Enum with ISO codes.
};

type FactInvolvement = {
  Id_Fait: number;
  Implication: PersonRole;
  Global_Id: number;
};

type LegalRepresentativeInvolvement = {
  Personne_Id: number;
  Global_Id: number;
};

export type Involvement = FactInvolvement | LegalRepresentativeInvolvement;

export interface Person {
  CP_Commune_Naissance: number;
  Naissance_Lieu: string;
  Insee_Lieu_Naiss: number;
  Pays_Naissance: Country;

  Adresse: string;
  CP_Commune_Residence: number;
  Insee_Lieu_Res: number;
  Pays_Residence: Country;

  Profession: XMLLeafWithAttrs<1098, "professions", string>;
  Commune_Residence: string;

  Global_Id: number;
  Personne_Id: number;

  Nom: string;
  Nom_Marital?: string;
  Prenom: string;
  Civilite_Sexe: "F" | "M";
  Validite_Etat_Civil: "Identité déclarée" | "Identitée manifestement fausse";
  Nature_Etat_Civil: string; // Enum.
  Nationalite: XMLLeafWithAttrs<99160, "nationalites", string> & ISOCode;

  Nom_Pere: string;
  Prenom_Pere: string;

  Nom_Mere: string;
  Prenom_Mere: string;

  Telephone_Portable: string;
  Situation_Familiale: string; // TODO: enum.

  Interprete: boolean;

  Curatelle: boolean;
  Curateur?: string;

  Tutelle: boolean;
  Representant_Legal_Tutelle?: string;

  Implications: {
    Faits?: FactInvolvement[];
    Representants_Legaux?: {
      Physiques: LegalRepresentativeInvolvement[];
    };
  };
}
type GeneralInformation = {
  Jonction: boolean;
  Depaysement: boolean;
  Scelles: boolean;
};

export type RawAnalysis = {
  Analyse_TRISTAN: {
    Faits: Array<Fact>;
    Personnes: {
      Physiques: Array<Person>;
      Morales: Array<Person>;
    };
    Infos_Generales: GeneralInformation;
  };
};

interface PersonWithRole<Role> extends Person {
  role: Role;
}

export type PersonWithGenericRole = Person & {
  role: PersonRole;
};

export type BackendAnalysis = {
  facts: Array<Fact>;
  victims: PersonWithRole<PersonRole.Victim>;
  witnesses: PersonWithRole<PersonRole.Witness>;
  indictees: PersonWithRole<PersonRole.Indictee>;
  others: PersonWithRole<PersonRole.Other>;
  general: GeneralInformation;
};

export type LayoutConstraints = {
  alignmentConstraint?: {
    horizontal?: string[][];
    vertical?: string[][];
  };
  relativePlacementConstraint: {
    left: string;
    right: string;
  }[];
};

export type GraphAnalysis = {
  elements: ElementDefinition[];
  layoutConstraints: LayoutConstraints;
};

function liftArray<T>(e: T | ArrayLike<T> | Iterable<T>): Array<T> {
  if (Array.isArray(e)) {
    return Array.from(e);
  } else {
    return [e as T];
  }
}

export function getImplications(entity: Person): Involvement[] {
  const { Implications } = entity;

  return [...(Implications.Faits || [])];
}

function isFactInvolvement(inv: Involvement): inv is FactInvolvement {
  return !!(inv as FactInvolvement).Id_Fait;
}

export function getFactImplications(entity: Person) {
  return getImplications(entity).filter(isFactInvolvement);
}
