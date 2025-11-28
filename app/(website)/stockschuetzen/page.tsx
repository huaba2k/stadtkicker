import SportCategoryPage from "../../../components/SportCategoryPage";

export default function StockschuetzenPage() {
  return (
    <SportCategoryPage 
      title="Abteilung Stockschützen"
      description="Unsere Aktivitäten auf der Bahn. Hier findest du Berichte zu Turnieren und Freundschaftsschießen."
      category="stockschuetzen" // Das muss exakt dem 'value' aus Sanity entsprechen!
    />
  );
}