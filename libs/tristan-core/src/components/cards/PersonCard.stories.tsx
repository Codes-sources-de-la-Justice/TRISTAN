import { ComponentStory, ComponentMeta } from "@storybook/react";
import { PersonCard } from "./Person";
import {PersonRole} from "../../static/model";

export default {
  component: PersonCard,
  title: "PersonCard",
} as ComponentMeta<typeof PersonCard>;

const Template: ComponentStory<typeof PersonCard> = (args) => (
  <PersonCard {...args} />
);

export const Primary = Template.bind({});

const p = {
 CP_Commune_Residence: 75019,
 CP_Commune_Naissance: 75019,
 Validite_Etat_Civil: "Identité manifestement fausse",
 Civilite_Sexe: "M",
 Nature_Etat_Civil: "a",
 Naissance_Date: "04/04/1998",
 Naissance_Lieu: "aa",
 Insee_Lieu_Naiss: 1,
 Insee_Lieu_Res: 2,
 Pays_Naissance: {"#text": "France"},
 Pays_Residence: {"#text": "France"},
 Profession: {"#text": "Retraité"},
 Commune_Residence: "aa",
 Global_Id: 1,
 Personne_Id: 1,
 Nom_Pere: "LAUTEUR",
 Prenom_Pere: "HENRY",
 Nom_Mere: "LAUTEUR",
 Prenom_Mere: "LAUTEUR",
 Telephone_Portable: "1999",
 Situation_Familiale: "Célibataire",
 Interprete: false,
 Curatelle: false,
 Tutelle: false,
 Implications: {},
 role: PersonRole.Indictee,
 Nationalite: "aa",
  Nom: "LAUTEUR",
  Prenom: "Henry",

  Adresse: "35 rue de la Gare",
};

Primary.args = {
 entity: p
};

