import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

const NVD_API_KEY = process.env.NVD_API_KEY; // Get from nvd.nist.gov and set as env variable

const server = new McpServer({
  name: "NVD-Vulnerability-Server",
  version: "1.0.0"
});

// Tool: Fetch specific CVE details
server.tool(
  "get_cve_details",
  "Retrieve detailed information for a specific CVE ID",
  { cve_id: z.string().describe("CVE ID in format CVE-YYYY-NNNNN") },
  async ({ cve_id }) => {
    const headers: Record<string, string> = {};
    if (NVD_API_KEY && NVD_API_KEY !== "your_api_key_here") {
      headers["apiKey"] = NVD_API_KEY;
    }

    const response = await axios.get(`https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${cve_id}`, {
      headers
    });
    
    const vulnerability = response.data.vulnerabilities[0]?.cve;
    if (!vulnerability) return { content: [{ type: "text", text: "CVE not found." }] };

    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify({
          id: vulnerability.id,
          description: vulnerability.descriptions[0].value,
          metrics: vulnerability.metrics
        }, null, 2) 
      }]
    };
  }
);

// Start the server using Stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
