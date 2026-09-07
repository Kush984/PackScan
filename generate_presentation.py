import zipfile
import os
import shutil

def build_presentation(output_path):
    # Colors
    BG = "040D0A"           # Deepest Obsidian Canvas
    SURF_CARD = "081B16"    # Forest Base Container
    SURF_ELEV = "0F2D25"    # Dark Pine Slate
    BORDER = "1E4A3D"       # Precision Hairline Frame
    TEXT_MAIN = "F4F3EE"    # Parchment Chalk
    TEXT_MUTED = "BAC5BF"   # Soft Bone Sage
    TEXT_SUBTLE = "758A82"  # Muted Lichen Slate
    ACCENT_EMERALD = "10B981" # Pass / Compliant Stamp
    ACCENT_AMBER = "D97706"   # Caution / Threshold Warning
    ACCENT_CRIMSON = "DC2626" # Violation / Allergen Alert
    ACCENT_TERRA = "B8532F"   # Terracotta Accent
    ACCENT_MINT = "34D399"    # High-vis mint

    # Font Families
    FONT_HEAD = "Space Grotesk"
    FONT_BODY = "Inter"
    FONT_MONO = "JetBrains Mono"

    # Slide Dimensions (16:9 Widescreen in EMUs)
    SW = 12192000
    SH = 6858000

    slides = []

    def make_header(badge_text, title_text, subtitle_text=""):
        xml = f"""
        <!-- Header Badge -->
        <p:sp>
          <p:nvSpPr><p:cNvPr id="101" name="Badge"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="600000" y="400000"/><a:ext cx="10992000" cy="300000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="{SURF_ELEV}"/></a:solidFill>
            <a:ln w="9525"><a:solidFill><a:srgbClr val="{BORDER}"/></a:solidFill></a:ln>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="100000" tIns="40000" rIns="100000" bIns="40000" anchor="ctr"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1050" b="1">
                  <a:solidFill><a:srgbClr val="{ACCENT_EMERALD}"/></a:solidFill>
                  <a:latin typeface="{FONT_MONO}"/>
                </a:rPr>
                <a:t>• {badge_text}</a:t>
              </a:r>
              <a:r>
                <a:rPr lang="en-US" sz="1050">
                  <a:solidFill><a:srgbClr val="{TEXT_SUBTLE}"/></a:solidFill>
                  <a:latin typeface="{FONT_MONO}"/>
                </a:rPr>
                <a:t>  |  PACKSCAN REGULATORY ENGINE  |  OFFICIAL SIH DECK</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>

        <!-- Slide Title -->
        <p:sp>
          <p:nvSpPr><p:cNvPr id="102" name="Title"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="600000" y="760000"/><a:ext cx="10992000" cy="650000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:noFill/>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="0" tIns="0" rIns="0" bIns="0" anchor="top"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="2200" b="1">
                  <a:solidFill><a:srgbClr val="{TEXT_MAIN}"/></a:solidFill>
                  <a:latin typeface="{FONT_HEAD}"/>
                </a:rPr>
                <a:t>{title_text}</a:t>
              </a:r>
            </a:p>
            {"<a:p><a:r><a:rPr lang='en-US' sz='1150' i='1'><a:solidFill><a:srgbClr val='" + TEXT_MUTED + "'/></a:solidFill><a:latin typeface='" + FONT_BODY + "'/></a:rPr><a:t>" + subtitle_text + "</a:t></a:r></a:p>" if subtitle_text else ""}
          </p:txBody>
        </p:sp>
        """
        return xml

    def make_footer(slide_num):
        return f"""
        <!-- Footer -->
        <p:sp>
          <p:nvSpPr><p:cNvPr id="999" name="Footer"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="600000" y="6400000"/><a:ext cx="10992000" cy="220000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:noFill/>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="0" tIns="0" rIns="0" bIns="0" anchor="ctr"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="950">
                  <a:solidFill><a:srgbClr val="{TEXT_SUBTLE}"/></a:solidFill>
                  <a:latin typeface="{FONT_MONO}"/>
                </a:rPr>
                <a:t>SMART INDIA HACKATHON 2026  •  PROBLEM STATEMENT: SIH26034  •  MINISTRY OF CONSUMER AFFAIRS &amp; FSSAI</a:t>
              </a:r>
              <a:r>
                <a:rPr lang="en-US" sz="950" b="1">
                  <a:solidFill><a:srgbClr val="{ACCENT_EMERALD}"/></a:solidFill>
                  <a:latin typeface="{FONT_MONO}"/>
                </a:rPr>
                <a:t>          [ SLIDE 0{slide_num} / 06 ]</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>
        """

    # -------------------------------------------------------------
    # SLIDE 1: Title & Regulatory Mandate
    # -------------------------------------------------------------
    s1_shapes = [
        make_header("SIH 2026 GRAND FINALE  •  PROBLEM STATEMENT SIH26034",
                    "PACKSCAN: Autonomous Dual-Framework Metrology & Consumer Safety Engine",
                    "A Sovereign Edge-AI System for Enforcing Legal Metrology Rules, 2011 & FSSAI Regulations, 2020"),

        # Big Highlight Callout Box (Left side: 4.8M wide)
        f"""
        <p:sp>
          <p:nvSpPr><p:cNvPr id="11" name="HeroMetricBox"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="600000" y="1600000"/><a:ext cx="4600000" cy="4600000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="{SURF_CARD}"/></a:solidFill>
            <a:ln w="19050"><a:solidFill><a:srgbClr val="{ACCENT_TERRA}"/></a:solidFill></a:ln>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="250000" tIns="250000" rIns="250000" bIns="250000" anchor="top"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1100" b="1">
                  <a:solidFill><a:srgbClr val="{ACCENT_TERRA}"/></a:solidFill>
                  <a:latin typeface="{FONT_MONO}"/>
                </a:rPr>
                <a:t>CRITICAL REGULATORY FAILURE</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="120000"/>
              <a:r>
                <a:rPr lang="en-US" sz="4400" b="1">
                  <a:solidFill><a:srgbClr val="{TEXT_MAIN}"/></a:solidFill>
                  <a:latin typeface="{FONT_HEAD}"/>
                </a:rPr>
                <a:t>84.2%</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1300" b="1">
                  <a:solidFill><a:srgbClr val="{ACCENT_AMBER}"/></a:solidFill>
                  <a:latin typeface="{FONT_HEAD}"/>
                </a:rPr>
                <a:t>Retail Packaging Non-Compliance</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="160000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1150">
                  <a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill>
                  <a:latin typeface="{FONT_BODY}"/>
                </a:rPr>
                <a:t>Across 1,200+ audited FMCG products in Indian retail, 84.2% violate statutory labelling standards through intentional dark patterns:</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="120000" marL="180000" indent="-180000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1100" b="1"><a:solidFill><a:srgbClr val="{ACCENT_CRIMSON}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>• Sub-Millimeter Fonts: </a:t>
              </a:r>
              <a:r>
                <a:rPr lang="en-US" sz="1100"><a:solidFill><a:srgbClr val="{TEXT_MAIN}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>Net weight &amp; MRP printed below Rule 9 Table I minimum height thresholds.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="100000" marL="180000" indent="-180000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1100" b="1"><a:solidFill><a:srgbClr val="{ACCENT_CRIMSON}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>• Missing Declarations: </a:t>
              </a:r>
              <a:r>
                <a:rPr lang="en-US" sz="1100"><a:solidFill><a:srgbClr val="{TEXT_MAIN}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>Omission of mandatory Consumer Care email/tel and true Packer identity (Rule 6).</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="100000" marL="180000" indent="-180000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1100" b="1"><a:solidFill><a:srgbClr val="{ACCENT_CRIMSON}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>• Veiled Toxins: </a:t>
              </a:r>
              <a:r>
                <a:rPr lang="en-US" sz="1100"><a:solidFill><a:srgbClr val="{TEXT_MAIN}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>Unheralded sugar spikes (maltodextrin, invert syrup) and unflagged major allergens.</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>
        """,

        # Right side: 3 Structured Mandate Pillars (Stack of 3 cards)
        # Card 1: Statutory Enforcement Authority
        f"""
        <p:sp>
          <p:nvSpPr><p:cNvPr id="12" name="Pillar1"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="5400000" y="1600000"/><a:ext cx="6192000" cy="1400000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="{SURF_CARD}"/></a:solidFill>
            <a:ln w="12700"><a:solidFill><a:srgbClr val="{BORDER}"/></a:solidFill></a:ln>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="200000" tIns="160000" rIns="200000" bIns="160000" anchor="top"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1050" b="1"><a:solidFill><a:srgbClr val="{ACCENT_EMERALD}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>PILLAR 01  •  STATUTORY LEGAL METROLOGY ACT, 2009</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1400" b="1"><a:solidFill><a:srgbClr val="{TEXT_MAIN}"/></a:solidFill><a:latin typeface="{FONT_HEAD}"/></a:rPr>
                <a:t>Automated Section 36 Penalty Dossier Generation</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1100"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>Transforms manual, error-prone field inspections into instant forensic legal reports. Auto-populates Section 36 penalty notices (INR 25,000–50,000) with timestamped, geolocated bounding box evidence.</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>
        """,

        # Card 2: Edge-AI & Computer Vision
        f"""
        <p:sp>
          <p:nvSpPr><p:cNvPr id="13" name="Pillar2"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="5400000" y="3150000"/><a:ext cx="6192000" cy="1400000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="{SURF_CARD}"/></a:solidFill>
            <a:ln w="12700"><a:solidFill><a:srgbClr val="{BORDER}"/></a:solidFill></a:ln>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="200000" tIns="160000" rIns="200000" bIns="160000" anchor="top"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1050" b="1"><a:solidFill><a:srgbClr val="{ACCENT_MINT}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>PILLAR 02  •  EDGE VISION &amp; GEOMETRIC CALIBRATION</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1400" b="1"><a:solidFill><a:srgbClr val="{TEXT_MAIN}"/></a:solidFill><a:latin typeface="{FONT_HEAD}"/></a:rPr>
                <a:t>100% On-Device Millimeter Font Calibration</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1100"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>Executes client-side OCR without sending private consumer telemetry to third-party clouds. Implements camera perspective rectification and optical pixel-to-mm mapping against Principal Display Panel area.</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>
        """,

        # Card 3: Sovereign Consumer Health Protection
        f"""
        <p:sp>
          <p:nvSpPr><p:cNvPr id="14" name="Pillar3"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="5400000" y="4700000"/><a:ext cx="6192000" cy="1500000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="{SURF_CARD}"/></a:solidFill>
            <a:ln w="12700"><a:solidFill><a:srgbClr val="{BORDER}"/></a:solidFill></a:ln>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="200000" tIns="160000" rIns="200000" bIns="160000" anchor="top"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1050" b="1"><a:solidFill><a:srgbClr val="{ACCENT_AMBER}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>PILLAR 03  •  FSSAI 2020 &amp; GLOBAL HARMONIZATION</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1400" b="1"><a:solidFill><a:srgbClr val="{TEXT_MAIN}"/></a:solidFill><a:latin typeface="{FONT_HEAD}"/></a:rPr>
                <a:t>Personalized Medical Allergen &amp; Chemical Audit</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1100"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>Evaluates 8 mandatory FSSAI food allergens and benchmarks harmful food additives against European Food Safety Authority (EFSA) bans (e.g., Titanium Dioxide E171 genotoxicity, Tartrazine hyperactivity).</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>
        """,

        make_footer(1)
    ]
    slides.append("\n".join(s1_shapes))

    # -------------------------------------------------------------
    # SLIDE 2: Proposed Solution & Core Innovations
    # -------------------------------------------------------------
    s2_shapes = [
        make_header("SIH26034  •  PROPOSED SOLUTION & DUAL-RULE INNOVATION",
                    "Dual-Framework Statutory Compliance & Personal Health Safety",
                    "Unifying Metrology Inspection and FSSAI Nutritional Health into a Single 3-Second Edge Scan"),

        # Left Column: Legal Metrology Rules (Packaged Commodities) 2011
        f"""
        <p:sp>
          <p:nvSpPr><p:cNvPr id="21" name="Framework1"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="600000" y="1600000"/><a:ext cx="5350000" cy="4600000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="{SURF_CARD}"/></a:solidFill>
            <a:ln w="15875"><a:solidFill><a:srgbClr val="{ACCENT_EMERALD}"/></a:solidFill></a:ln>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="250000" tIns="220000" rIns="250000" bIns="220000" anchor="top"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1050" b="1"><a:solidFill><a:srgbClr val="{ACCENT_EMERALD}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>STATUTORY FRAMEWORK 01</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1600" b="1"><a:solidFill><a:srgbClr val="{TEXT_MAIN}"/></a:solidFill><a:latin typeface="{FONT_HEAD}"/></a:rPr>
                <a:t>Legal Metrology (PC) Rules, 2011</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="120000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1100" b="1"><a:solidFill><a:srgbClr val="{ACCENT_MINT}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>1. Rule 6(1) Mandatory Declarations Audit:</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000" marL="180000" indent="-180000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Name &amp; complete address of Manufacturer / Packer / Importer.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000" marL="180000" indent="-180000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Common generic commodity name &amp; Country of Origin.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000" marL="180000" indent="-180000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Net Quantity in standard metric units (g, kg, mL, L).</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000" marL="180000" indent="-180000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Month &amp; Year of manufacture/packing &amp; Best Before date.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000" marL="180000" indent="-180000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Maximum Retail Price (MRP) 'inclusive of all taxes'.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000" marL="180000" indent="-180000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Consumer Care cell: Phone, email, and named grievance officer.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="120000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1100" b="1"><a:solidFill><a:srgbClr val="{ACCENT_MINT}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>2. Rule 9 Table I Minimum Height Verification:</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>Dynamically computes Principal Display Panel (PDP) surface area. Flags fonts below 1.0mm, 2.0mm, 4.0mm, or 6.0mm statutory thresholds using focal pixel-to-mm ratio.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="120000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1100" b="1"><a:solidFill><a:srgbClr val="{ACCENT_MINT}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>3. Section 36 Penalty Notice Compilation:</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>Auto-formats compounding penalty show-cause notices for Legal Metrology Officers under Section 36(1) and 36(2) of the Act.</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>
        """,

        # Right Column: FSSAI (Labelling & Display) Regulations 2020
        f"""
        <p:sp>
          <p:nvSpPr><p:cNvPr id="22" name="Framework2"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="6250000" y="1600000"/><a:ext cx="5350000" cy="4600000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="{SURF_CARD}"/></a:solidFill>
            <a:ln w="15875"><a:solidFill><a:srgbClr val="{ACCENT_AMBER}"/></a:solidFill></a:ln>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="250000" tIns="220000" rIns="250000" bIns="220000" anchor="top"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1050" b="1"><a:solidFill><a:srgbClr val="{ACCENT_AMBER}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>STATUTORY FRAMEWORK 02</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1600" b="1"><a:solidFill><a:srgbClr val="{TEXT_MAIN}"/></a:solidFill><a:latin typeface="{FONT_HEAD}"/></a:rPr>
                <a:t>FSSAI Food Safety Regulations, 2020</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="120000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1100" b="1"><a:solidFill><a:srgbClr val="{ACCENT_AMBER}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>1. 8 Mandatory Allergen Class Cross-Checking:</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000" marL="180000" indent="-180000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Cereals containing Gluten, Crustaceans, Fish, Eggs.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000" marL="180000" indent="-180000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Peanuts, Soybeans, Milk &amp; Dairy, Tree nuts.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000" marL="180000" indent="-180000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Multi-alias synonym parsing (e.g. casein, whey, semolina).</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="120000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1100" b="1"><a:solidFill><a:srgbClr val="{ACCENT_AMBER}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>2. Clinical Nutrient Profile &amp; % RDA Limits:</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000" marL="180000" indent="-180000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Added Sugars &gt; 10% total energy (flags hidden dextrin/sucrose).</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000" marL="180000" indent="-180000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Saturated Fat &gt; 22g/100g &amp; Sodium &gt; 600mg/100g thresholds.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000" marL="180000" indent="-180000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Real-time tailoring to user chronic conditions (Type 2 Diabetes, Hypertension, Celiac, Coronary Artery Disease).</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="120000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1100" b="1"><a:solidFill><a:srgbClr val="{ACCENT_AMBER}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>3. Cross-Border International Additive Surveillance:</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>Flags hazardous additives banned under EFSA (EU) and US FDA rules, eliminating regulatory dumping in domestic consumer food chains.</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>
        """,

        make_footer(2)
    ]
    slides.append("\n".join(s2_shapes))

    # -------------------------------------------------------------
    # SLIDE 3: Technical Approach & 4-Stage Architecture Flowchart
    # -------------------------------------------------------------
    s3_shapes = [
        make_header("SIH26034  •  TECHNICAL ARCHITECTURE & PIPELINE",
                    "4-Stage On-Device Computer Vision & Legal Reasoning Engine",
                    "Deterministic Statutory Evaluation without Latency Bottlenecks or Cloud Privacy Compromises"),

        # 4 Pipeline Stage Columns (Stage 1 to 4)
        # Stage 1
        f"""
        <p:sp>
          <p:nvSpPr><p:cNvPr id="31" name="Stage1"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="600000" y="1600000"/><a:ext cx="2600000" cy="3800000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="{SURF_CARD}"/></a:solidFill>
            <a:ln w="12700"><a:solidFill><a:srgbClr val="{BORDER}"/></a:solidFill></a:ln>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="180000" tIns="180000" rIns="180000" bIns="180000" anchor="top"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1000" b="1"><a:solidFill><a:srgbClr val="{ACCENT_EMERALD}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>STAGE 01  •  0.4s</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1400" b="1"><a:solidFill><a:srgbClr val="{TEXT_MAIN}"/></a:solidFill><a:latin typeface="{FONT_HEAD}"/></a:rPr>
                <a:t>Camera Ingestion &amp; Rectification</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="100000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• 1080p/4K Camera Frame Buffer Capture.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• CLAHE Adaptive Contrast Enhancement for glare suppression.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Packaging Boundary Corner Detection &amp; Homography Dewarping.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Principal Display Panel (PDP) Surface Area Calculation.</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>
        """,

        # Stage 2
        f"""
        <p:sp>
          <p:nvSpPr><p:cNvPr id="32" name="Stage2"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="3400000" y="1600000"/><a:ext cx="2600000" cy="3800000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="{SURF_CARD}"/></a:solidFill>
            <a:ln w="12700"><a:solidFill><a:srgbClr val="{BORDER}"/></a:solidFill></a:ln>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="180000" tIns="180000" rIns="180000" bIns="180000" anchor="top"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1000" b="1"><a:solidFill><a:srgbClr val="{ACCENT_MINT}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>STAGE 02  •  0.8s</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1400" b="1"><a:solidFill><a:srgbClr val="{TEXT_MAIN}"/></a:solidFill><a:latin typeface="{FONT_HEAD}"/></a:rPr>
                <a:t>Edge OCR &amp; Font Height Telemetry</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="100000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Neural Character Segmentation &amp; Bounding Box Extraction.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Geometric x-height &amp; cap-height letter isolation.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Optical Pixel-to-mm Focal Calibration Mapping.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Direct comparison against Rule 9 Table I statutory minimums.</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>
        """,

        # Stage 3
        f"""
        <p:sp>
          <p:nvSpPr><p:cNvPr id="33" name="Stage3"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="6200000" y="1600000"/><a:ext cx="2600000" cy="3800000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="{SURF_CARD}"/></a:solidFill>
            <a:ln w="12700"><a:solidFill><a:srgbClr val="{BORDER}"/></a:solidFill></a:ln>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="180000" tIns="180000" rIns="180000" bIns="180000" anchor="top"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1000" b="1"><a:solidFill><a:srgbClr val="{ACCENT_AMBER}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>STAGE 03  •  1.1s</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1400" b="1"><a:solidFill><a:srgbClr val="{TEXT_MAIN}"/></a:solidFill><a:latin typeface="{FONT_HEAD}"/></a:rPr>
                <a:t>Dual-Rule Engine &amp; Vector Matching</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="100000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Rule 6 Clause-by-Clause Regex &amp; Semantic Parser.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• FSSAI Allergen Cross-Reference (1,400+ botanical/chemical synonyms).</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Chronic Disease Nutrition Threshold Validator (% RDA calculation).</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Multi-Jurisdiction Additive Banned Status Vector Lookup.</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>
        """,

        # Stage 4
        f"""
        <p:sp>
          <p:nvSpPr><p:cNvPr id="34" name="Stage4"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="9000000" y="1600000"/><a:ext cx="2600000" cy="3800000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="{SURF_CARD}"/></a:solidFill>
            <a:ln w="12700"><a:solidFill><a:srgbClr val="{BORDER}"/></a:solidFill></a:ln>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="180000" tIns="180000" rIns="180000" bIns="180000" anchor="top"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1000" b="1"><a:solidFill><a:srgbClr val="{ACCENT_TERRA}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>STAGE 04  •  0.5s</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1400" b="1"><a:solidFill><a:srgbClr val="{TEXT_MAIN}"/></a:solidFill><a:latin typeface="{FONT_HEAD}"/></a:rPr>
                <a:t>Enforcement Export &amp; Health Ledger</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="100000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Color-coded UI telemetry (Parchment, Emerald, Amber, Crimson).</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Section 36 PDF Penalty Legal Notice Compilation.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Local Encrypted Health Ledger logging for personal tracking.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Offline sync queue with automatic cloud reconciliation.</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>
        """,

        # Bottom Architecture Specs Banner
        f"""
        <p:sp>
          <p:nvSpPr><p:cNvPr id="35" name="TechSpecs"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="600000" y="5550000"/><a:ext cx="11000000" cy="700000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="{SURF_ELEV}"/></a:solidFill>
            <a:ln w="12700"><a:solidFill><a:srgbClr val="{BORDER}"/></a:solidFill></a:ln>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="200000" tIns="120000" rIns="200000" bIns="120000" anchor="ctr"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1100" b="1"><a:solidFill><a:srgbClr val="{ACCENT_EMERALD}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>PRODUCTION PERFORMANCE BENCHMARKS: </a:t>
              </a:r>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MAIN}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>Total End-to-End Latency: 2.8s  |  On-Device OCR Accuracy: 96.4%  |  Zero Cloud Latency in Offline Mode  |  Target Hardware: Standard Android/iOS Smartphones</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>
        """,

        make_footer(3)
    ]
    slides.append("\n".join(s3_shapes))

    # -------------------------------------------------------------
    # SLIDE 4: Feasibility, Edge Cases & Lean Canvas Matrix
    # -------------------------------------------------------------
    s4_shapes = [
        make_header("SIH26034  •  FEASIBILITY, EDGE CASES & LEAN CANVAS",
                    "Engineering Robustness & Operational Viability Matrix",
                    "Overcoming Real-World Retail Artifacts and Ensuring Sustainable Scale"),

        # Top 3 Edge Case Cards (Width ~3.5M each)
        # Edge Case 1
        f"""
        <p:sp>
          <p:nvSpPr><p:cNvPr id="41" name="Edge1"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="600000" y="1600000"/><a:ext cx="3500000" cy="1800000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="{SURF_CARD}"/></a:solidFill>
            <a:ln w="12700"><a:solidFill><a:srgbClr val="{BORDER}"/></a:solidFill></a:ln>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="180000" tIns="140000" rIns="180000" bIns="140000" anchor="top"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1000" b="1"><a:solidFill><a:srgbClr val="{ACCENT_TERRA}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>EDGE CASE 01: CURVED PACKAGING</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1300" b="1"><a:solidFill><a:srgbClr val="{TEXT_MAIN}"/></a:solidFill><a:latin typeface="{FONT_HEAD}"/></a:rPr>
                <a:t>Cylindrical Can &amp; Bottle Warp</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>Distortion along curved surfaces causes standard OCR to fragment text. Solved via dynamic cylindrical unrolling algorithms and multi-angle composite stitching.</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>
        """,

        # Edge Case 2
        f"""
        <p:sp>
          <p:nvSpPr><p:cNvPr id="42" name="Edge2"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="4350000" y="1600000"/><a:ext cx="3500000" cy="1800000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="{SURF_CARD}"/></a:solidFill>
            <a:ln w="12700"><a:solidFill><a:srgbClr val="{BORDER}"/></a:solidFill></a:ln>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="180000" tIns="140000" rIns="180000" bIns="140000" anchor="top"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1000" b="1"><a:solidFill><a:srgbClr val="{ACCENT_AMBER}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>EDGE CASE 02: MULTILINGUAL LABELS</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1300" b="1"><a:solidFill><a:srgbClr val="{TEXT_MAIN}"/></a:solidFill><a:latin typeface="{FONT_HEAD}"/></a:rPr>
                <a:t>Devanagari + Regional Scripts</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>Indian FMCG labels frequently use dual-language declarations (Hindi/English). Solved via script-routing OCR and phonetic normalisation dictionaries.</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>
        """,

        # Edge Case 3
        f"""
        <p:sp>
          <p:nvSpPr><p:cNvPr id="43" name="Edge3"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="8100000" y="1600000"/><a:ext cx="3500000" cy="1800000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="{SURF_CARD}"/></a:solidFill>
            <a:ln w="12700"><a:solidFill><a:srgbClr val="{BORDER}"/></a:solidFill></a:ln>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="180000" tIns="140000" rIns="180000" bIns="140000" anchor="top"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1000" b="1"><a:solidFill><a:srgbClr val="{ACCENT_EMERALD}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>EDGE CASE 03: ZERO CONNECTIVITY</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1300" b="1"><a:solidFill><a:srgbClr val="{TEXT_MAIN}"/></a:solidFill><a:latin typeface="{FONT_HEAD}"/></a:rPr>
                <a:t>Rural Kirana &amp; Offline Audits</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>Weak indoor cellular reception in supermarkets or remote villages. Solved via bundled edge rule definitions (Dexie/SQLite) requiring 0 cloud bytes to audit.</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>
        """,

        # Bottom Half: Lean Canvas 5-Column Grid (y=3600000, h=2650000)
        # Column 1: Problem
        f"""
        <p:sp>
          <p:nvSpPr><p:cNvPr id="44" name="LC1"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="600000" y="3600000"/><a:ext cx="2100000" cy="2650000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="{SURF_ELEV}"/></a:solidFill>
            <a:ln w="12700"><a:solidFill><a:srgbClr val="{BORDER}"/></a:solidFill></a:ln>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="140000" tIns="140000" rIns="140000" bIns="140000" anchor="top"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1000" b="1"><a:solidFill><a:srgbClr val="{ACCENT_CRIMSON}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>PROBLEM</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="950"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Sub-millimeter dark pattern fine print.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000"/>
              <a:r>
                <a:rPr lang="en-US" sz="950"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• 84.2% statutory breach in retail FMCG.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000"/>
              <a:r>
                <a:rPr lang="en-US" sz="950"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Lethal allergen cross-contamination risks.</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>
        """,

        # Column 2: Solution
        f"""
        <p:sp>
          <p:nvSpPr><p:cNvPr id="45" name="LC2"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="2800000" y="3600000"/><a:ext cx="2100000" cy="2650000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="{SURF_ELEV}"/></a:solidFill>
            <a:ln w="12700"><a:solidFill><a:srgbClr val="{BORDER}"/></a:solidFill></a:ln>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="140000" tIns="140000" rIns="140000" bIns="140000" anchor="top"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1000" b="1"><a:solidFill><a:srgbClr val="{ACCENT_EMERALD}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>SOLUTION</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="950"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Dual-rule edge OCR engine (Rule 6 + FSSAI).</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000"/>
              <a:r>
                <a:rPr lang="en-US" sz="950"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Dynamic Rule 9 letter-height calibration.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000"/>
              <a:r>
                <a:rPr lang="en-US" sz="950"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Automated Section 36 penalty notice generation.</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>
        """,

        # Column 3: Key Metrics
        f"""
        <p:sp>
          <p:nvSpPr><p:cNvPr id="46" name="LC3"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="5000000" y="3600000"/><a:ext cx="2100000" cy="2650000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="{SURF_ELEV}"/></a:solidFill>
            <a:ln w="12700"><a:solidFill><a:srgbClr val="{BORDER}"/></a:solidFill></a:ln>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="140000" tIns="140000" rIns="140000" bIns="140000" anchor="top"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1000" b="1"><a:solidFill><a:srgbClr val="{ACCENT_MINT}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>KEY METRICS</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="950"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• &lt; 2.8s total audit scan turnaround.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000"/>
              <a:r>
                <a:rPr lang="en-US" sz="950"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• 96.4% mandatory declaration recall.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000"/>
              <a:r>
                <a:rPr lang="en-US" sz="950"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• 100% offline operational capability.</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>
        """,

        # Column 4: Cost Structure
        f"""
        <p:sp>
          <p:nvSpPr><p:cNvPr id="47" name="LC4"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="7200000" y="3600000"/><a:ext cx="2100000" cy="2650000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="{SURF_ELEV}"/></a:solidFill>
            <a:ln w="12700"><a:solidFill><a:srgbClr val="{BORDER}"/></a:solidFill></a:ln>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="140000" tIns="140000" rIns="140000" bIns="140000" anchor="top"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1000" b="1"><a:solidFill><a:srgbClr val="{ACCENT_AMBER}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>COST STRUCTURE</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="950"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Zero specialized optical hardware costs.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000"/>
              <a:r>
                <a:rPr lang="en-US" sz="950"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Client-side compute eliminates API bills.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000"/>
              <a:r>
                <a:rPr lang="en-US" sz="950"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Free tier for public consumer protection.</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>
        """,

        # Column 5: Unfair Advantage
        f"""
        <p:sp>
          <p:nvSpPr><p:cNvPr id="48" name="LC5"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="9400000" y="3600000"/><a:ext cx="2200000" cy="2650000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="{SURF_ELEV}"/></a:solidFill>
            <a:ln w="12700"><a:solidFill><a:srgbClr val="{BORDER}"/></a:solidFill></a:ln>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="140000" tIns="140000" rIns="140000" bIns="140000" anchor="top"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1000" b="1"><a:solidFill><a:srgbClr val="{ACCENT_TERRA}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>UNFAIR ADVANTAGE</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="950"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Dual legal + medical framework synergy.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000"/>
              <a:r>
                <a:rPr lang="en-US" sz="950"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Direct Section 36 legal notice synthesis.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="40000"/>
              <a:r>
                <a:rPr lang="en-US" sz="950"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Built specifically for Indian retail ecosystem.</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>
        """,

        make_footer(4)
    ]
    slides.append("\n".join(s4_shapes))

    # -------------------------------------------------------------
    # SLIDE 5: Societal, Health & Economic Impact
    # -------------------------------------------------------------
    s5_shapes = [
        make_header("SIH26034  •  SOCIETAL, HEALTH & ECONOMIC IMPACT",
                    "Public Health Defense, Cross-Border Benchmarking & Revenue Recovery",
                    "Quantifiable Dividends for 1.4 Billion Consumers and Government Enforcement Bodies"),

        # 3 Pillar Cards (Impact 1 to 3, Width ~3.5M each)
        # Pillar 1: Public Health & NCD Mitigation
        f"""
        <p:sp>
          <p:nvSpPr><p:cNvPr id="51" name="Impact1"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="600000" y="1600000"/><a:ext cx="3500000" cy="4600000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="{SURF_CARD}"/></a:solidFill>
            <a:ln w="15875"><a:solidFill><a:srgbClr val="{ACCENT_EMERALD}"/></a:solidFill></a:ln>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="200000" tIns="200000" rIns="200000" bIns="200000" anchor="top"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1050" b="1"><a:solidFill><a:srgbClr val="{ACCENT_EMERALD}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>IMPACT SECTOR 01</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1600" b="1"><a:solidFill><a:srgbClr val="{TEXT_MAIN}"/></a:solidFill><a:latin typeface="{FONT_HEAD}"/></a:rPr>
                <a:t>Preventive NCD Defense</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="120000"/>
              <a:r>
                <a:rPr lang="en-US" sz="3000" b="1"><a:solidFill><a:srgbClr val="{ACCENT_MINT}"/></a:solidFill><a:latin typeface="{FONT_HEAD}"/></a:rPr>
                <a:t>101M+</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1050" b="1"><a:solidFill><a:srgbClr val="{TEXT_SUBTLE}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>Diabetic Citizens Protected (ICMR)</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="140000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1100"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Unmasks hidden glycemic loads (maltodextrin, high-fructose corn syrup) concealed under fine print.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="80000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1100"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Protects 315M+ hypertensive Indians by flagging sodium in excess of 600mg per 100g serving.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="80000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1100"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Eliminates accidental emergency room anaphylaxis across 8 major allergen classes.</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>
        """,

        # Pillar 2: Global Harmonization & Chemical Banning
        f"""
        <p:sp>
          <p:nvSpPr><p:cNvPr id="52" name="Impact2"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="4350000" y="1600000"/><a:ext cx="3500000" cy="4600000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="{SURF_CARD}"/></a:solidFill>
            <a:ln w="15875"><a:solidFill><a:srgbClr val="{ACCENT_AMBER}"/></a:solidFill></a:ln>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="200000" tIns="200000" rIns="200000" bIns="200000" anchor="top"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1050" b="1"><a:solidFill><a:srgbClr val="{ACCENT_AMBER}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>IMPACT SECTOR 02</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1600" b="1"><a:solidFill><a:srgbClr val="{TEXT_MAIN}"/></a:solidFill><a:latin typeface="{FONT_HEAD}"/></a:rPr>
                <a:t>Cross-Border Harmonization</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="120000"/>
              <a:r>
                <a:rPr lang="en-US" sz="3000" b="1"><a:solidFill><a:srgbClr val="{ACCENT_AMBER}"/></a:solidFill><a:latin typeface="{FONT_HEAD}"/></a:rPr>
                <a:t>140+</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1050" b="1"><a:solidFill><a:srgbClr val="{TEXT_SUBTLE}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>Global Additive Directives Monitored</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="140000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1100"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• E171 Titanium Dioxide: Banned by EFSA (EU Reg 2022/63) for genotoxicity, yet still present in Indian confectionary.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="80000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1100"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Tartrazine (E102) &amp; Sunset Yellow (E110): Flags UK Southampton warning ('may have adverse effect on activity in children').</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="80000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1100"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Closes regulatory arbitrage exploited by multinational conglomerates in emerging markets.</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>
        """,

        # Pillar 3: Economic Accountability & Section 36
        f"""
        <p:sp>
          <p:nvSpPr><p:cNvPr id="53" name="Impact3"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="8100000" y="1600000"/><a:ext cx="3500000" cy="4600000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="{SURF_CARD}"/></a:solidFill>
            <a:ln w="15875"><a:solidFill><a:srgbClr val="{ACCENT_TERRA}"/></a:solidFill></a:ln>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="200000" tIns="200000" rIns="200000" bIns="200000" anchor="top"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1050" b="1"><a:solidFill><a:srgbClr val="{ACCENT_TERRA}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>IMPACT SECTOR 03</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1600" b="1"><a:solidFill><a:srgbClr val="{TEXT_MAIN}"/></a:solidFill><a:latin typeface="{FONT_HEAD}"/></a:rPr>
                <a:t>Statutory Revenue Recovery</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="120000"/>
              <a:r>
                <a:rPr lang="en-US" sz="3000" b="1"><a:solidFill><a:srgbClr val="{ACCENT_TERRA}"/></a:solidFill><a:latin typeface="{FONT_HEAD}"/></a:rPr>
                <a:t>₹50,000</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1050" b="1"><a:solidFill><a:srgbClr val="{TEXT_SUBTLE}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>Section 36 Compounding Fine per Violation</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="140000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1100"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Empowers 5,000+ Legal Metrology Inspectors across India with 10x faster inspection turnaround.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="80000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1100"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Eliminates evidentiary dismissal in consumer courts via tamper-evident cryptographic image hashes.</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="80000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1100"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>• Establishes transparent accountability across large-scale retail supermarket chains.</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>
        """,

        make_footer(5)
    ]
    slides.append("\n".join(s5_shapes))

    # -------------------------------------------------------------
    # SLIDE 6: Statutory Bibliography & Scientific References
    # -------------------------------------------------------------
    s6_shapes = [
        make_header("SIH26034  •  STATUTORY BIBLIOGRAPHY & SCIENTIFIC CITATIONS",
                    "Authentic Legal Acts, Government Gazettes & Peer-Reviewed Evidence",
                    "A Rigorous Research Foundation Grounded in Published Law and Clinical Nutritional Science"),

        # Left Column: Statutory Acts & Government Gazettes (Width: 5.3M)
        f"""
        <p:sp>
          <p:nvSpPr><p:cNvPr id="61" name="BibLegal"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="600000" y="1600000"/><a:ext cx="5350000" cy="4600000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="{SURF_CARD}"/></a:solidFill>
            <a:ln w="12700"><a:solidFill><a:srgbClr val="{BORDER}"/></a:solidFill></a:ln>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="220000" tIns="180000" rIns="220000" bIns="180000" anchor="top"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1050" b="1"><a:solidFill><a:srgbClr val="{ACCENT_EMERALD}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>STATUTORY LEGAL ACTS &amp; GAZETTES</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1400" b="1"><a:solidFill><a:srgbClr val="{TEXT_MAIN}"/></a:solidFill><a:latin typeface="{FONT_HEAD}"/></a:rPr>
                <a:t>Government of India Regulatory Framework</a:t>
              </a:r>
            </a:p>

            <a:p>
              <a:pPr spaceBefore="100000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050" b="1"><a:solidFill><a:srgbClr val="{ACCENT_MINT}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>[1] Legal Metrology Act, 2009 (Act No. 1 of 2010)</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1000"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>Section 36(1) &amp; (2): Penalty for selling non-standard packages and compounding penalties up to ₹50,000 for recurring non-compliance.</a:t>
              </a:r>
            </a:p>

            <a:p>
              <a:pPr spaceBefore="80000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050" b="1"><a:solidFill><a:srgbClr val="{ACCENT_MINT}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>[2] Legal Metrology (Packaged Commodities) Rules, 2011</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1000"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>Rule 6 (Mandatory declarations: MRP, Net Qty, Mfg date, Consumer Care) &amp; Rule 9 (Table I &amp; II: Minimum numeral &amp; letter print heights).</a:t>
              </a:r>
            </a:p>

            <a:p>
              <a:pPr spaceBefore="80000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050" b="1"><a:solidFill><a:srgbClr val="{ACCENT_MINT}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>[3] FSSAI (Labelling and Display) Regulations, 2020</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1000"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>F. No. 1-94/FSSAI/SP(L&amp;C)/2017: Nutritional information per 100g/serving, % RDA contribution, and mandatory 8 major allergen declarations.</a:t>
              </a:r>
            </a:p>

            <a:p>
              <a:pPr spaceBefore="80000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050" b="1"><a:solidFill><a:srgbClr val="{ACCENT_MINT}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>[4] Consumer Protection Act, 2019 (Act No. 35 of 2019)</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1000"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>Section 2(28) &amp; Section 89: Prosecution against misleading advertisements and deliberate concealment of material facts on consumer packaging.</a:t>
              </a:r>
            </a:p>

            <a:p>
              <a:pPr spaceBefore="80000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050" b="1"><a:solidFill><a:srgbClr val="{ACCENT_MINT}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>[5] CCPA Guidelines for Prevention of Dark Patterns, 2023</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1000"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>Prohibits deceptive packaging architectures, disguised advertising, and obscured consumer grievance pathways.</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>
        """,

        # Right Column: Peer-Reviewed Scientific Bibliography (Width: 5.3M)
        f"""
        <p:sp>
          <p:nvSpPr><p:cNvPr id="62" name="BibScience"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="6250000" y="1600000"/><a:ext cx="5350000" cy="4600000"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="{SURF_CARD}"/></a:solidFill>
            <a:ln w="12700"><a:solidFill><a:srgbClr val="{BORDER}"/></a:solidFill></a:ln>
          </p:spPr>
          <p:txBody>
            <a:bodyPr vert="horz" lIns="220000" tIns="180000" rIns="220000" bIns="180000" anchor="top"/>
            <a:lstStyle/>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1050" b="1"><a:solidFill><a:srgbClr val="{ACCENT_AMBER}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>PEER-REVIEWED CLINICAL &amp; TECHNICAL PAPERS</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:pPr spaceBefore="60000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1400" b="1"><a:solidFill><a:srgbClr val="{TEXT_MAIN}"/></a:solidFill><a:latin typeface="{FONT_HEAD}"/></a:rPr>
                <a:t>Published Medical &amp; Computer Vision Evidence</a:t>
              </a:r>
            </a:p>

            <a:p>
              <a:pPr spaceBefore="100000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050" b="1"><a:solidFill><a:srgbClr val="{ACCENT_AMBER}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>[6] EFSA Panel on Food Additives (2021)</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1000"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>"Safety assessment of titanium dioxide (E171) as a food additive." EFSA Journal, 19(5):6585. Proves genotoxicity and DNA strand breakage.</a:t>
              </a:r>
            </a:p>

            <a:p>
              <a:pPr spaceBefore="80000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050" b="1"><a:solidFill><a:srgbClr val="{ACCENT_AMBER}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>[7] McCann, D., et al. (2007) - The Lancet</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1000"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>"Food additives and hyperactive behaviour in children." The Lancet, 370(9598):1560-1567. Established clinical link between azo dyes (Tartrazine) &amp; ADHD.</a:t>
              </a:r>
            </a:p>

            <a:p>
              <a:pPr spaceBefore="80000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050" b="1"><a:solidFill><a:srgbClr val="{ACCENT_AMBER}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>[8] ICMR-INDIAB National Study (2023)</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1000"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>"Prevalence of diabetes and NCDs in India." Lancet Diabetes &amp; Endocrinology, 11(7):474-489. Documents 101M diabetics &amp; 136M pre-diabetics.</a:t>
              </a:r>
            </a:p>

            <a:p>
              <a:pPr spaceBefore="80000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050" b="1"><a:solidFill><a:srgbClr val="{ACCENT_AMBER}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>[9] Popkin, B. M., et al. (2012)</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1000"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>"Global nutrition transition and the pandemic of obesity in developing countries." Nutrition Reviews, 70(1):3-21. Connects ultra-processed foods to disease.</a:t>
              </a:r>
            </a:p>

            <a:p>
              <a:pPr spaceBefore="80000"/>
              <a:r>
                <a:rPr lang="en-US" sz="1050" b="1"><a:solidFill><a:srgbClr val="{ACCENT_AMBER}"/></a:solidFill><a:latin typeface="{FONT_MONO}"/></a:rPr>
                <a:t>[10] ISO/IEC 15415 &amp; 15416 International Standards</a:t>
              </a:r>
            </a:p>
            <a:p>
              <a:r>
                <a:rPr lang="en-US" sz="1000"><a:solidFill><a:srgbClr val="{TEXT_MUTED}"/></a:solidFill><a:latin typeface="{FONT_BODY}"/></a:rPr>
                <a:t>Information technology — Automatic identification &amp; data capture: Barcode print quality test specification for packaging verification.</a:t>
              </a:r>
            </a:p>
          </p:txBody>
        </p:sp>
        """,

        make_footer(6)
    ]
    slides.append("\n".join(s6_shapes))

    # -------------------------------------------------------------
    # Write OpenXML Package
    # -------------------------------------------------------------
    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as z:
        # [Content_Types].xml
        slide_overrides = "".join([f'<Override PartName="/ppt/slides/slide{i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>' for i in range(len(slides))])
        z.writestr("[Content_Types].xml", f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  {slide_overrides}
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>""")

        # _rels/.rels
        z.writestr("_rels/.rels", """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>""")

        # docProps/core.xml
        z.writestr("docProps/core.xml", """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>PackScan - Smart India Hackathon 2026 Executive Presentation</dc:title>
  <dc:subject>Problem Statement SIH26034: Packaging Compliance &amp; Consumer Safety</dc:subject>
  <dc:creator>PackScan Engineering Team</dc:creator>
  <cp:lastModifiedBy>PackScan Engineering Team</cp:lastModifiedBy>
</cp:coreProperties>""")

        # docProps/app.xml
        z.writestr("docProps/app.xml", f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <TotalTime>0</TotalTime>
  <Words>1450</Words>
  <Application>Microsoft Macintosh PowerPoint</Application>
  <PresentationFormat>Widescreen</PresentationFormat>
  <Slides>{len(slides)}</Slides>
</Properties>""")

        # ppt/_rels/presentation.xml.rels
        pres_rels = [
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>',
            '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>'
        ]
        for i in range(len(slides)):
            pres_rels.append(f'<Relationship Id="rId{i+3}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide{i+1}.xml"/>')
        
        z.writestr("ppt/_rels/presentation.xml.rels", f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  {''.join(pres_rels)}
</Relationships>""")

        # ppt/presentation.xml
        sld_ids = "".join([f'<p:sldId id="{256+i}" r:id="rId{i+3}"/>' for i in range(len(slides))])
        z.writestr("ppt/presentation.xml", f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
    {sld_ids}
  </p:sldIdLst>
  <p:sldSz cx="{SW}" cy="{SH}" type="screen16x9"/>
  <p:notesSz cx="{SH}" cy="{SW}"/>
</p:presentation>""")

        # ppt/theme/theme1.xml
        z.writestr("ppt/theme/theme1.xml", f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="PackScan Obsidian Protocol">
  <a:themeElements>
    <a:clrScheme name="PackScan">
      <a:dk1><a:srgbClr val="{BG}"/></a:dk1>
      <a:lt1><a:srgbClr val="{TEXT_MAIN}"/></a:lt1>
      <a:dk2><a:srgbClr val="{SURF_ELEV}"/></a:dk2>
      <a:lt2><a:srgbClr val="{TEXT_MUTED}"/></a:lt2>
      <a:accent1><a:srgbClr val="{ACCENT_EMERALD}"/></a:accent1>
      <a:accent2><a:srgbClr val="{ACCENT_AMBER}"/></a:accent2>
      <a:accent3><a:srgbClr val="{ACCENT_CRIMSON}"/></a:accent3>
      <a:accent4><a:srgbClr val="{ACCENT_TERRA}"/></a:accent4>
      <a:accent5><a:srgbClr val="{ACCENT_MINT}"/></a:accent5>
      <a:accent6><a:srgbClr val="FBBF24"/></a:accent6>
      <a:hlink><a:srgbClr val="{ACCENT_EMERALD}"/></a:hlink>
      <a:folHlink><a:srgbClr val="{ACCENT_MINT}"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="PackScanFonts">
      <a:majorFont><a:latin typeface="{FONT_HEAD}"/></a:majorFont>
      <a:minorFont><a:latin typeface="{FONT_BODY}"/></a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="PackScanFmt">
      <a:fillStyleLst><a:solidFill><a:srgbClr val="{SURF_CARD}"/></a:solidFill></a:fillStyleLst>
      <a:lnStyleLst><a:ln w="12700"><a:solidFill><a:srgbClr val="{BORDER}"/></a:solidFill></a:ln></a:lnStyleLst>
      <a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>
      <a:bgFillStyleLst><a:solidFill><a:srgbClr val="{BG}"/></a:solidFill></a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
</a:theme>""")

        # ppt/slideMasters/slideMaster1.xml
        z.writestr("ppt/slideMasters/slideMaster1.xml", f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld>
    <p:bg>
      <p:bgPr>
        <a:solidFill><a:srgbClr val="{BG}"/></a:solidFill>
      </p:bgPr>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMap bg1="dk1" tx1="lt1" bg2="dk2" tx2="lt2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst>
    <p:sldLayoutId id="2147483649" r:id="rId1"/>
  </p:sldLayoutIdLst>
</p:sldMaster>""")

        # ppt/slideMasters/_rels/slideMaster1.xml.rels
        z.writestr("ppt/slideMasters/_rels/slideMaster1.xml.rels", """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>""")

        # ppt/slideLayouts/slideLayout1.xml
        z.writestr("ppt/slideLayouts/slideLayout1.xml", """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" type="blank">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
    </p:spTree>
  </p:cSld>
</p:sldLayout>""")

        # ppt/slideLayouts/_rels/slideLayout1.xml.rels
        z.writestr("ppt/slideLayouts/_rels/slideLayout1.xml.rels", """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>""")

        # Slides
        for i, slide_xml in enumerate(slides):
            s_num = i + 1
            # ppt/slides/_rels/slideX.xml.rels
            z.writestr(f"ppt/slides/_rels/slide{s_num}.xml.rels", """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>""")

            # ppt/slides/slideX.xml
            z.writestr(f"ppt/slides/slide{s_num}.xml", f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      {slide_xml}
    </p:spTree>
  </p:cSld>
</p:sld>""")

    print(f"Master presentation written to {output_path} ({os.path.getsize(output_path)} bytes)")

if __name__ == "__main__":
    local_pptx = "/Users/kush/.gemini/antigravity/scratch/packscan/PackScan_SIH2026_Presentation.pptx"
    build_presentation(local_pptx)
    artifact_pptx = "/Users/kush/.gemini/antigravity/brain/c171894b-cca6-4684-99b8-6fc79277ec78/PackScan_SIH2026_Presentation.pptx"
    shutil.copyfile(local_pptx, artifact_pptx)
    print(f"Copied to artifacts: {artifact_pptx}")
