# Case Study: Building Budget Tracker with Agentic AI Engineering

## Overview

Budget Tracker was built as a full-stack application using AI-augmented engineering practices. This case study documents the development process, the challenges overcome, and how agentic AI (Claude via Cowork and Claude Code) served as a collaborative engineering partner for someone with a traumatic brain injury (TBI).

## Developer Background

**Lawrence Jefferson II** (also known as Menoko OG)
- 24 years U.S. Army (Combat Engineer, CI/HUMINT support, Airborne support)
- Survivor of traumatic brain injury (TBI) from combat
- Senior backend systems engineer and full-stack developer
- Founder and CTO of Crimson Obsidian Industries & Labs
- Strong systems thinking and pattern recognition despite cognitive challenges

## The Goal

Build a personal finance application that:
1. Works reliably on a home server (not cloud-dependent)
2. Demonstrates full-stack deployment and DevOps competency
3. Serves as an open-source reference for others with similar challenges
4. Showcases AI-assisted engineering for individuals with neurocognitive differences

## Development Journey

### Phase 1: Project Setup & Architecture

**Challenge:** Setting up a modern full-stack monorepo with npm workspaces while ensuring Docker multi-stage builds worked correctly.

**Solution:** Used Claude Cowork to establish:
- React 18 + Vite frontend (SPA with TypeScript)
- Express.js API (Node 20)
- PostgreSQL 16 database
- npm workspaces with single root node_modules
- Docker multi-stage build (deps → frontend-build → api-build → runtime)

**Key Learning:** Multi-stage Docker builds require careful understanding of how layers are reused and how build arguments are passed to specific stages.

### Phase 2: Environment Configuration & CORS Issues

**Challenge:** Managing different environment configurations across:
- Local development (Vite dev server on :5173)
- Docker local testing (API on :3000)
- Home server deployment (accessing from different IP)

**Problem:** The frontend made API calls using `import.meta.env.VITE_API_URL`, a build-time variable that gets baked into compiled code. Misconfigurations caused:
- CORS errors when frontend origin didn't match API expectation
- Hardcoded `http://localhost:3000` breaking on home server
- Confusion between build-time variables and runtime environment variables

**Solution:** 
- Created `.env.docker` for Docker-specific runtime configuration
- Passed `VITE_API_URL` as a Docker build argument (not runtime env var)
- Used relative path (`VITE_API_URL=/`) to make frontend resilient to different deployment origins
- Separated development (`.env`) from Docker (`.env.docker`) configuration

**Key Learning:** The distinction between build-time variables (Vite env) and runtime environment variables is critical. Build-time variables are compiled into the frontend and cannot be changed at runtime.

### Phase 3: Debugging Serious Issues

**Challenge:** After initial deployment to home server, the application loaded but API calls failed with DNS resolution errors.

**The Mystery:** 
- Frontend was being served correctly from `http://192.168.0.231:3000`
- But API calls were going to `http://api/categories` (non-existent hostname)
- Should have been `/api/categories` (relative) or `http://192.168.0.231:3000/api/categories` (absolute)

**Debugging Process:**
1. Examined Docker container logs and verified the API was running
2. Checked browser console for specific error messages (ERR_NAME_NOT_RESOLVED)
3. Verified Vite environment variables were being set correctly
4. Inspected docker-compose.yml build arguments
5. Traced through Dockerfile stages to ensure ARG was passed to frontend-build
6. Identified Docker layer caching was preventing rebuild with new configuration

**Solution:**
- Forced Docker rebuild without cache by modifying Dockerfile with timestamped comment
- Added debug output (`echo "Building with VITE_API_URL=${VITE_API_URL}"`) to verify variable was present
- Re-ran `docker compose down && docker compose up -d --build`
- Confirmed API calls now made to relative paths

**Key Learning:** Docker layer caching can hide configuration changes. When debugging Docker builds, always consider whether changes were actually applied or if cached layers are reusing old compiled code.

**Workflow Lesson:** The developer has TBI and requested:
- No code snippets in chat (they cause confusion)
- Changes made locally and pushed to GitHub
- They would pull and test on the server

This constraint actually improved the development process by:
- Forcing clear separation of concerns (local development, remote deployment)
- Maintaining a clean git history
- Allowing the developer to control when and how changes were tested

### Phase 4: Home Server Deployment & DevOps

**Challenge:** Successfully deploying the application to a home server using CasaOS/Dockpeek.

**Learning Areas:**
- Network fundamentals (IP addressing, port mapping, firewall)
- Docker container orchestration (docker compose, volumes, healthchecks)
- Database persistence (PostgreSQL volumes survive container restarts)
- Multi-stage Docker builds and layer optimization
- Environment variable handling across development and production

**Deployment Setup:**
- Home server running CasaOS with Docker
- PostgreSQL in a named volume for persistence
- API and frontend in a single container
- Accessible at `http://192.168.0.231:3000` internally

### Phase 5: Agentic AI Engineering Practices

**How Claude Cowork & Code Were Used:**

1. **Architecture Planning:** Claude helped design the monorepo structure and Docker build strategy without prescribing implementation details.

2. **Collaborative Debugging:** Rather than providing code snippets, Claude:
   - Identified the core issue (VITE_API_URL not being set correctly)
   - Explained why the problem occurred (Docker layer caching)
   - Guided the developer through systematic debugging
   - Made targeted changes and pushed to Git

3. **DevOps Mentorship:** Claude served as a knowledgeable engineering partner, explaining:
   - Why certain configurations were necessary
   - How Docker multi-stage builds optimize image size
   - The difference between build-time and runtime variables
   - Network debugging techniques

4. **Accessibility-Focused Collaboration:** Adapted to the developer's needs:
   - No code snippets (they overwhelm with TBI)
   - Clear explanations of concepts
   - Written changes available on Git (instead of verbal instructions)
   - Progress tracking with regular synchronization

## Technical Challenges Overcome

| Challenge | Solution | Learning |
|-----------|----------|----------|
| npm workspaces with single root node_modules | Proper Dockerfile COPYs from deps stage | Monorepo architecture requires careful layer dependencies |
| CORS errors on different network origins | Relative API paths (VITE_API_URL=/) | Hardcoded URLs break portability |
| Docker not rebuilding with new config | Cache invalidation comments and explicit rebuilds | Docker caching is aggressive; must explicitly invalidate |
| Environment variable confusion | Separated .env (dev) from .env.docker (runtime) | Build-time ≠ runtime variables |
| Multi-stage build optimization | Frontend dist copied to API public directory | Optimized final image size by reusing layers |

## Results

✅ **Working Application:** Budget Tracker runs reliably on home server  
✅ **Persistent Data:** PostgreSQL volume ensures data survives restarts  
✅ **DevOps Competency:** Full deployment pipeline understood and executed  
✅ **Network Understanding:** Learned IP addressing, DNS, CORS, port forwarding  
✅ **Debugging Skills:** Traced issues from browser console to Docker layer caching  
✅ **Open Source Ready:** Documented for others to learn from and contribute

## Key Insights

### 1. Accessibility in Engineering
AI engineering partners can be adapted to work with cognitive differences:
- Written over verbal communication
- Concept explanations over code snippets
- Systematic debugging over trial-and-error
- Clear documentation and Git-based workflow

### 2. DevOps is Learnable
Despite complexity, a structured approach works:
- Understand each layer (frontend, API, database, Docker, networking)
- Debug systematically (narrow the problem space)
- Iterate with confidence (Git lets you revert safely)

### 3. Home Server Deployment is Viable
Personal computing doesn't require cloud platforms:
- Docker makes deployment portable
- Home servers are cost-effective
- Learning value exceeds cost savings
- Suitable for personal applications

### 4. Agentic AI for Engineering
AI works best as a collaborator, not a code generator:
- Explains concepts clearly
- Debugs systematically
- Respects developer constraints
- Maintains clean code practices

## What's Next

### Immediate
- [ ] Expose live demo endpoint via Cloudflare Tunnel
- [ ] Complete documentation (CONTRIBUTING, SECURITY, LICENSE)
- [ ] Add unit and integration tests

### Short-term
- [ ] Feature enhancements (categories/budgets UI improvements)
- [ ] Dark mode support
- [ ] CSV export for data portability

### Long-term
- [ ] Mobile-responsive design
- [ ] Multi-user support
- [ ] Advanced reporting and analytics
- [ ] Showcase as template for others building with AI assistance

## For Other Developers with TBI

**You can do this too.** Key practices that helped:

1. **Work with your constraints, not against them:**
   - If code snippets overwhelm you, ask for explanations
   - If you need to see code, use your editor
   - Use AI as a thinking partner, not a code provider

2. **Take frequent breaks:**
   - Debugging full-stack issues is cognitively intensive
   - You will get frustrated; that's normal
   - Walk away, come back fresh

3. **Build with others:**
   - AI partners can augment your capabilities
   - Community support matters
   - Document your journey (it helps others)

4. **Learn one thing at a time:**
   - Don't try to learn Node AND Docker AND PostgreSQL AND networking simultaneously
   - Focus on one layer
   - Build understanding incrementally

5. **Home servers are your friend:**
   - No monthly bills
   - Full control
   - Great learning opportunity
   - Perfect for personal applications

## Acknowledgments

This project exemplifies how modern AI tools can support developers with neurocognitive differences to build professional-quality applications. The collaboration model—AI as engineering partner, not code generator—proved especially valuable for maintaining code quality while working within TBI constraints.

Special thanks to Claude (via Anthropic's Cowork and Code tools) for patient, systematic collaboration through hours of debugging and learning.

## References

- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [PostgreSQL in Docker](https://hub.docker.com/_/postgres)
- [npm Workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
