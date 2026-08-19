import React from "react";
import { useState } from "react";
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

  console.log("Criteria:", analysisData.criteria);
  console.log("Tasks:", analysisData.tasks);
  console.log("APIs:", analysisData.apis);
  console.log(
    "DB TABLES:",
    JSON.stringify(analysisData?.dbTables, null, 2)
  );
  console.log("Edge Cases:", analysisData.edgeCases);
  console.log("Analysis keys:", Object.keys(analysisData || {}));

  const [selectedEvidence, setSelectedEvidence] = useState(null);

  function handleSelectCriterion(criterion) {
      setSelectedEvidence({
          active_context: {
              title: "Acceptance Criterion",
              source_doc: criterion.src || "Uploaded document",
              excerpt: criterion.text,
          },
          related: analysisData.evidence?.related || [],
      });
  }

  if (!analysisData) {
    return (
      <div className="p-8">
        <p>No analysis result found.</p>
      </div>
    );
  }

  const handleReanalyze = () => {
    navigate("/analyzer");
  };

  const handleExport = () => {
    toast.success("Analysis report exported successfully!");
  };

  return (
    <div className="p-6 md:p-8 min-h-full bg-[var(--bg-primary)] text-[var(--text-primary)] space-y-6">

      <Toaster position="top-right" richColors />

      <AnalysisHeader
        analysis={analysisData}
        onReanalyze={handleReanalyze}
        onExport={handleExport}
      />

      <GroundedInsightBanner
        projectName={analysisData.project}
        relatedCount={analysisData.related_count}
        onViewSources={() =>
          toast.info("Displaying active context sources.")
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        <div className="lg:col-span-8 space-y-6">

          {/* SUMMARY */}
          <div className="p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Summary
            </h3>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {analysisData.summary || "No summary available."}
            </p>
          </div>

          {/* ACCEPTANCE CRITERIA */}
          <AcceptanceCriteriaCard criteria={analysisData.criteria} onSelectCriterion={handleSelectCriterion} />

          {/* TASKS */}
          <GeneratedTasksSection
            tasks={analysisData.tasks || []}
            onExportJira={() =>
              toast.info("Connecting to Jira workspace...")
            }
          />

          {/* APIs */}
          <APIsSection
            apiContract={analysisData.apis || []}
          />

          {/* DATABASE */}
          <DatabaseSchemaSection
            schema={analysisData.db_tables || []}
          />

          {/* EDGE CASES */}
          <EdgeCasesSection
            edgeCases={analysisData.edge_cases || []}
          />

        </div>

        {/* EVIDENCE */}
        <div className="lg:col-span-4 sticky top-6">
          <EvidenceDrawer evidence={selectedEvidence} />
        </div>

      </div>
    </div>
  );
}