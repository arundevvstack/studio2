
"use server";

import { initializeFirebase } from "@/firebase";
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp, writeBatch } from "firebase/firestore";

/**
 * @fileOverview Server action to bulk import talent data from Google Sheets CSV.
 * Includes duplicate prevention based on Name + District.
 */

const CSV_URL = "https://docs.google.com/spreadsheets/d/1tywlKErw_lCW12Gwi_T7Ia-skrpqp_KK5SOgwDJLPIk/export?format=csv&gid=515767873";

export async function importShootNetworkFromSheet() {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error("Failed to fetch Google Sheet data");
    
    const csvText = await response.text();
    const rows = csvText.split('\n').map(row => row.split(',').map(cell => cell.trim()));
    
    // Skip header row
    const dataRows = rows.slice(1);
    const { firestore } = initializeFirebase();
    const talentRef = collection(firestore, "shoot_network");
    const batch = writeBatch(firestore);
    
    let importedCount = 0;
    let duplicateCount = 0;

    for (const row of dataRows) {
      const [name, age, district, category, gender, colabText, paymentStage, referredBy, social, portfolio] = row;
      
      if (!name || !district) continue;

      // Duplicate prevention: Check if NAME + DISTRICT exists
      const q = query(talentRef, where("name", "==", name), where("district", "==", district));
      const existing = await getDocs(q);
      
      if (!existing.empty) {
        duplicateCount++;
        continue;
      }

      const colabCategories = colabText ? colabText.split(';').map(s => s.trim()).filter(s => s) : [];
      const docId = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${district.toLowerCase()}`;
      const newDocRef = doc(talentRef, docId);

      const talentData = {
        id: docId,
        name,
        age,
        district,
        category,
        gender,
        colabCategories,
        paymentStage,
        referredBy,
        socialMediaContact: social,
        portfolio,
        isArchived: false,
        thumbnail: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      batch.set(newDocRef, talentData);
      importedCount++;
    }

    await batch.commit();

    return {
      success: true,
      message: `Import complete. ${importedCount} profiles synchronized. ${duplicateCount} duplicates skipped.`,
      count: importedCount
    };
  } catch (error: any) {
    console.error("Bulk Import Error:", error);
    return { success: false, message: error.message || "Strategic synchronization failed." };
  }
}
