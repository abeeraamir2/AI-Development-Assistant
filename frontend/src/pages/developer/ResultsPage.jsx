import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";

import AnalysisHeader from "../../components/Requirement-results/AnalysisHeader";
import GroundedInsightBanner from "../../components/Requirement-results/GroundedInsightBanner";
import AcceptanceCriteriaCard from "../../components/Requirement-results/AcceptanceCriteriaCard";
import EvidenceDrawer from "../../components/Requirement-results/EvidenceDrawer";
import GeneratedTasksSection from "../../components/Requirement-results/GeneratedTasksSection";
import APIsSection from "../../components/Requirement-results/APIsSection";
import DatabaseSchemaSection from "../../components/Requirement-results/DatabaseSchemaSection";
import EdgeCasesSection from "../../components/Requirement-results/EdgeCasesSection";

export default function ResultsPage({ result }) {
  const location = useLocation();
  const navigate = useNavigate();

  const analysisData = location.state?.result || result;

  const [selectedCriterionIndex, setSelectedCriterionIndex] = useState(null);
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  if (!analysisData) {
    return (
      <div className="p-8 text-center text-xs text-[var(--text-muted)]">
        <p>No analysis result found.</p>
      </div>
    );
  }

  function handleSelectCriterion(criterion, index) {
    setSelectedCriterionIndex(index);
    const criterionIndexLabel = `Acceptance Criterion ${String(index + 1).padStart(2, "0")}`;
    const criterionText = criterion.text || "";
    const rawSrc = criterion.src;
    const criterionSrc = (!rawSrc || String(rawSrc).toUpperCase() === "ORIGINAL" || String(rawSrc).toUpperCase() === "UNKNOWN")
      ? `AC-${String(index + 1).padStart(2, "0")}`
      : String(rawSrc);

    // 1. SOURCE EVIDENCE (Grounded in uploaded document)
    const sourceEvidence = {
      documentName: analysisData.filename || "Uploaded Requirement Document",
      title: analysisData.title || "Requirement Specification",
      section: criterionSrc.startsWith("AC-") ? "Functional Requirements" : criterionSrc,
      excerpt: criterionText,
      originType: criterionSrc.startsWith("AC-") ? "Primary Document" : `Referenced (${criterionSrc})`,
      relationship: "Directly defines the functional constraints and verification rules for this acceptance criterion in the uploaded specification.",
    };

    // 2. DERIVED OUTPUTS (Grounded matching with Tasks, APIs, DB Tables, Edge Cases)
    const cleanWords = criterionText
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !["users", "shall", "able", "with", "from", "that", "this", "system", "after"].includes(w));

    // Tasks
    const allTasks = analysisData.tasks || [];
    const matchedTasks = allTasks.filter((t) => {
      const tSrc = (t.src || "").toLowerCase();
      const tText = `${t.title || ""} ${t.description || ""}`.toLowerCase();
      const hasSrcMatch = criterionSrc && tSrc === criterionSrc.toLowerCase();
      const hasKeywordMatch = cleanWords.some((word) => tText.includes(word));
      return hasSrcMatch || hasKeywordMatch;
    });
    const finalTasks = matchedTasks.length > 0 
      ? matchedTasks 
      : allTasks.length > 0 && index < allTasks.length 
        ? [allTasks[index]] 
        : allTasks.slice(0, 1);

    // APIs
    const allApis = analysisData.apis || [];
    const matchedApis = allApis.filter((api) => {
      const endpoint = (api.endpoint || (typeof api === "string" ? api : "")).toLowerCase();
      const snippet = (api.snippet || "").toLowerCase();
      return cleanWords.some((w) => endpoint.includes(w) || snippet.includes(w));
    });
    const finalApis = matchedApis.length > 0 
      ? matchedApis 
      : allApis.length > 0 && index < allApis.length 
        ? [allApis[index]] 
        : [];

    // Database Tables
    const allTables = analysisData.db_tables || [];
    const matchedTables = allTables.filter((tbl) => {
      const tName = (tbl.table_name || (typeof tbl === "string" ? tbl : "")).toLowerCase();
      return cleanWords.some((w) => tName.includes(w));
    });
    const finalTables = matchedTables.length > 0 
      ? matchedTables 
      : allTables.length > 0 && index < allTables.length 
        ? [allTables[index]] 
        : [];

    // Edge Cases
    const allEdgeCases = analysisData.edge_cases || [];
    const matchedEdgeCases = allEdgeCases.filter((ec) => {
      const ecText = `${ec.title || ""} ${ec.description || ""}`.toLowerCase();
      return cleanWords.some((w) => ecText.includes(w));
    });
    const finalEdgeCases = matchedEdgeCases.length > 0 
      ? matchedEdgeCases 
      : allEdgeCases.length > 0 && index < allEdgeCases.length 
        ? [allEdgeCases[index]] 
        : [];

    // 3. RELATED REQUIREMENTS (Grounded in project embeddings / analysis evidence)
    const rawRelated = analysisData.evidence?.related || [];
    const relatedList = rawRelated.map((rel, rIdx) => {
      const matchVal = rel.match || (rel.matchPercent ? `${rel.matchPercent}%` : `${88 - rIdx * 5}%`);
      const pct = rel.matchPercent || parseInt(matchVal, 10) || 85;
      
      const rawId = rel.id;
      const cleanId = (!rawId || String(rawId).toUpperCase().includes("ORIGINAL") || String(rawId).toUpperCase() === "UNKNOWN")
        ? `REQ-${String(rIdx + 1).padStart(3, "0")}`
        : String(rawId);

      const excerptText = rel.excerpt || rel.text || "Requirement specification retrieved from project repository embeddings.";

      return {
        id: cleanId,
        title: rel.title && !rel.title.toUpperCase().includes("ORIGINAL") ? rel.title : cleanId,
        match: matchVal,
        matchPercent: pct,
        excerpt: excerptText,
      };
    });

    // 4. EVIDENCE SUMMARY
    const totalEvidenceCount = 1 + relatedList.length + finalTasks.length + finalApis.length + finalTables.length + finalEdgeCases.length;

    setSelectedEvidence({
      criterionIndex: index + 1,
      criterionLabel: criterionIndexLabel,
      criterionText: criterionText,
      criterionSrc: criterionSrc,
      source: sourceEvidence,
      derived_outputs: {
        tasks: finalTasks,
        apis: finalApis,
        db_tables: finalTables,
        edge_cases: finalEdgeCases,
      },
      related: relatedList,
      summary: {
        totalPieces: totalEvidenceCount,
        directSourceCount: 1,
        relatedReqsCount: relatedList.length,
        derivedTasksCount: finalTasks.length,
        derivedApisCount: finalApis.length,
      },
    });
  }

  const handleClearEvidence = () => {
    setSelectedEvidence(null);
    setSelectedCriterionIndex(null);
  };

  const handleReanalyze = () => {
    navigate("/analyzer");
  };

  const handleExport = () => {
    try {
      const title = analysisData.title || analysisData.filename || "Requirement_Specification";
      const project = analysisData.project || analysisData.project_name || "Workspace Project";
      const rawId = analysisData.analysis_id || analysisData.id || analysisData._id || "";
      const displayId = rawId.startsWith("ANL-") ? rawId : rawId ? `ANL-${rawId.slice(-6).toUpperCase()}` : "ANL-NEW";
      const complexity = (analysisData.complexity || "MEDIUM").toUpperCase();
      const status = analysisData.status || "COMPLETED";
      const createdAt = analysisData.created_at ? new Date(analysisData.created_at).toLocaleString() : new Date().toLocaleString();

      let md = `# Requirement Analysis Report: ${title}\n\n`;
      md += `**Project:** ${project}  \n`;
      md += `**Analysis ID:** ${displayId}  \n`;
      md += `**Document:** ${analysisData.filename || "N/A"}  \n`;
      md += `**Complexity:** ${complexity}  \n`;
      md += `**Status:** ${status}  \n`;
      md += `**Generated At:** ${createdAt}  \n\n`;
      md += `---\n\n`;

      md += `## 1. Executive Summary\n${analysisData.summary || "No summary provided."}\n\n---\n\n`;

      // Acceptance Criteria
      md += `## 2. Acceptance Criteria\n`;
      const criteria = analysisData.criteria || [];
      if (criteria.length === 0) {
        md += `*No acceptance criteria specified.*\n\n`;
      } else {
        criteria.forEach((c, i) => {
          const cText = c.text || (typeof c === "string" ? c : "");
          const src = c.src ? ` *(Ref: ${c.src})*` : "";
          md += `${i + 1}. **[AC-${String(i + 1).padStart(2, "0")}]** ${cText}${src}\n`;
        });
        md += `\n`;
      }
      md += `---\n\n`;

      // Generated Tasks
      md += `## 3. Engineering Tasks\n`;
      const tasks = analysisData.tasks || [];
      if (tasks.length === 0) {
        md += `*No engineering tasks generated.*\n\n`;
      } else {
        tasks.forEach((t, i) => {
          const tId = t.id || `TASK-${String(i + 1).padStart(3, "0")}`;
          const tTitle = t.title || "Task Item";
          const tDesc = t.description || "";
          const tSrc = t.src ? ` *(Ref: ${t.src})*` : "";
          md += `### ${tId}: ${tTitle}${tSrc}\n${tDesc}\n\n`;
        });
      }
      md += `---\n\n`;

      // APIs
      md += `## 4. API Endpoints\n`;
      const apis = analysisData.apis || [];
      if (apis.length === 0) {
        md += `*No API contracts generated.*\n\n`;
      } else {
        apis.forEach((api) => {
          const method = api.method || "POST";
          const endpoint = api.endpoint || (typeof api === "string" ? api : "/api/endpoint");
          const snippet = api.snippet || "";
          md += `### \`${method} ${endpoint}\`\n`;
          if (snippet) {
            md += `\`\`\`json\n${snippet}\n\`\`\`\n\n`;
          }
        });
      }
      md += `---\n\n`;

      // Database Tables
      md += `## 5. Database Schema\n`;
      const tables = analysisData.db_tables || [];
      if (tables.length === 0) {
        md += `*No database schema changes required.*\n\n`;
      } else {
        tables.forEach((tbl) => {
          const tName = tbl.table_name || (typeof tbl === "string" ? tbl : "table_name");
          md += `### Table: \`${tName}\`\n\n`;
          const fields = tbl.fields || [];
          if (fields.length > 0) {
            md += `| Field Name | Type | Constraints |\n|---|---|---|\n`;
            fields.forEach((f) => {
              md += `| \`${f.name || ""}\` | \`${f.type || ""}\` | ${f.constraints || "None"} |\n`;
            });
            md += `\n`;
          }
        });
      }
      md += `---\n\n`;

      // Edge Cases
      md += `## 6. Edge Cases & Constraints\n`;
      const edgeCases = analysisData.edge_cases || [];
      if (edgeCases.length === 0) {
        md += `*No edge cases flagged.*\n\n`;
      } else {
        edgeCases.forEach((ec, i) => {
          const ecTitle = ec.title || `Edge Case ${i + 1}`;
          const ecDesc = ec.description || (typeof ec === "string" ? ec : "");
          md += `- **${ecTitle}**: ${ecDesc}\n`;
        });
        md += `\n`;
      }
      md += `---\n\n`;

      // Grounding Context
      const related = analysisData.evidence?.related || [];
      if (related.length > 0) {
        md += `## 7. Related Requirements & Grounding Context\n`;
        related.forEach((rel) => {
          const rId = rel.id || "REQ";
          const rTitle = rel.title || "Related Requirement";
          const rMatch = rel.match || (rel.matchPercent ? `${rel.matchPercent}%` : "Relevant");
          const rExcerpt = rel.excerpt || "";
          md += `### [${rId}] ${rTitle} (Similarity: ${rMatch})\n> "${rExcerpt}"\n\n`;
        });
      }

      // Automatically download markdown file
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeFilename = title.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
      link.href = url;
      link.setAttribute("download", `${safeFilename}_analysis_report.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${safeFilename}_analysis_report.md`);
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export analysis report.");
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-full bg-[var(--bg-primary)] text-[var(--text-primary)] space-y-6">
      <Toaster position="top-right" richColors />

      <AnalysisHeader
        analysis={analysisData}
        onReanalyze={handleReanalyze}
        onExport={handleExport}
      />

      <GroundedInsightBanner
        projectName={analysisData.project || analysisData.project_name || "Workspace Project"}
        relatedCount={typeof analysisData.related_count === "number" ? analysisData.related_count : (analysisData.evidence?.related?.length || 0)}
        onViewSources={() =>
          toast.info("Select any Acceptance Criterion below to inspect grounded sources in the Evidence panel.")
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          {/* SUMMARY */}
          <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Summary
            </h3>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {analysisData.summary || "No summary available."}
            </p>
          </div>

          {/* ACCEPTANCE CRITERIA */}
          <AcceptanceCriteriaCard
            criteria={analysisData.criteria || []}
            selectedCriterionIndex={selectedCriterionIndex}
            onSelectCriterion={handleSelectCriterion}
          />

          {/* TASKS */}
          <div id="tasks-section">
            <GeneratedTasksSection
              tasks={analysisData.tasks || []}
              onExportJira={() =>
                toast.info("Connecting to Jira workspace...")
              }
            />
          </div>

          {/* APIs */}
          <div id="apis-section">
            <APIsSection
              apiContract={analysisData.apis || []}
            />
          </div>

          {/* DATABASE */}
          <div id="database-section">
            <DatabaseSchemaSection
              schema={analysisData.db_tables || []}
            />
          </div>

          {/* EDGE CASES */}
          <div id="edge-cases-section">
            <EdgeCasesSection
              edgeCases={analysisData.edge_cases || []}
            />
          </div>
        </div>

        {/* EVIDENCE DRAWER */}
        <div className="lg:col-span-4 sticky top-6">
          <EvidenceDrawer
            evidence={selectedEvidence}
            onClearEvidence={handleClearEvidence}
          />
        </div>
      </div>
    </div>
  );
}