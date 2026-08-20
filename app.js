console.log("THE CEO VAULT starting...");

const { createClient } = supabase;

const client = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

async function checkVaultAccess() {
  const { data, error } = await client.rpc("ceo_vault_access_check");

  if (error) {
    console.error("Vault access error:", error);
    return;
  }

  console.log("Vault Access:", data);

  window.vaultAccess = data;
}

checkVaultAccess();


// CEO VAULT - Promote Intelligence Claim to Evidence

async function promoteClaimToEvidence(claimData) {

  const { data, error } = await client
    .from("evidence")
    .insert([
      {
        game_id: claimData.game_id || null,
        source_id: claimData.source_id || null,
        subject_type: claimData.category || "intel",
        claim: claimData.canonical_claim,
        verification_status: "pending",
        confidence: claimData.confidence || 0,
        notes: claimData.evidence_notes || "Promoted from Source Intelligence"
      }
    ])
    .select();

  if (error) {
    console.error("Evidence promotion failed:", error);
    alert("Evidence promotion failed");
    return;
  }

  console.log("Evidence created:", data);
  alert("Claim promoted to Evidence Queue");
}


window.promoteClaimToEvidence = promoteClaimToEvidence;
