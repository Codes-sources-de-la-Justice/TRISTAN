import { ComponentStory, ComponentMeta } from "@storybook/react";
import { FactCard } from "./Fact";

export default {
  component: FactCard,
  title: "FactCard",
} as ComponentMeta<typeof FactCard>;

const Template: ComponentStory<typeof FactCard> = (args) => (
  <FactCard {...args} />
);

export const Primary = Template.bind({});

const p = {
 Nom_Region: "Ile-de-France",
 Nature_Lieu: { "#text": "HABITATION INDIVIDUELLE" },
 Qualification: "DELIT",
 Pays: { "#text": "France", "@id": 99160, "@ref": "pays" },
 Recidive: false,
 Complicite: false,
 Libelle: "BOLOGNAISE SANS SAUCE TOMATE",
 Natinf: 999999,
 Libelle_Magistrat: {
   Lieux: [ { Lieu: "Chez Marie" } ],
   Dates: [ { Date: "Le 3sept" } ],
   Explication: "parce que, oula c'est compliqué",
   Articles_Prevus: [ { Valeur: "ART.11111", Lien: "Par là" } ],
   Articles_Reprimes: []
 },
 Code_Postal_Commune: 75013,
 Commune: "Paris 13e",
 Code_Insee_Commune: 75013,
 Nom_Departement: "IDF",
 Localisation: "Qq part",
 GpsX: 3.23,
 GpsY: 2.25,
 Id_Fait: 1,
 Global_Id: 2,
 Periode_Affaire_Debut: { "@utc": "1-1-1", "#text": "Le 1er Septembre"},
 Periode_Affaire_Fin: { "@utc": "1-1-1", "#text": "Le 2nd Septembre"}
};

Primary.args = {
  entity: p,
};
