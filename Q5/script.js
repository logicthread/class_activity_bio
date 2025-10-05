// Database Data Dictionary Tool - Main JavaScript File
class DataDictionaryTool {
    constructor() {
        this.schema = null;
        this.parsedData = null;
        this.currentDiagram = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTabs();
        this.loadSampleData();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // File input
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Schema parsing
        document.getElementById('parseSchema').addEventListener('click', () => this.parseSchema());
        document.getElementById('loadSample').addEventListener('click', () => this.loadSampleSchema());
        document.getElementById('clearInput').addEventListener('click', () => this.clearInput());

        // Diagram controls
        document.getElementById('refreshDiagram').addEventListener('click', () => this.generateDiagram());
        document.getElementById('layoutType').addEventListener('change', () => this.generateDiagram());
        document.getElementById('showColumns').addEventListener('change', () => this.generateDiagram());
        document.getElementById('showTypes').addEventListener('change', () => this.generateDiagram());
        document.getElementById('showKeys').addEventListener('change', () => this.generateDiagram());

        // Search and filter
        document.getElementById('searchTables').addEventListener('input', (e) => this.filterDictionary(e.target.value));
        document.getElementById('filterByType').addEventListener('change', (e) => this.filterDictionary());

        // Export functions
        document.getElementById('exportHTML').addEventListener('click', () => this.exportHTML());
        document.getElementById('exportPDF').addEventListener('click', () => this.exportPDF());
        document.getElementById('exportImage').addEventListener('click', () => this.exportImage());
        document.getElementById('exportJSON').addEventListener('click', () => this.exportJSON());
    }

    setupTabs() {
        // Initialize first tab as active
        this.switchTab('input');
    }

    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });

        // Show selected tab content
        document.getElementById(tabName).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            document.getElementById('schemaInput').value = content;
            
            // Auto-detect format
            if (file.name.endsWith('.json')) {
                document.querySelector('input[value="json"]').checked = true;
            } else if (file.name.endsWith('.xml')) {
                document.querySelector('input[value="xml"]').checked = true;
            }
            
            this.showStatus('File loaded successfully', 'success');
        };
        reader.readAsText(file);
    }

    parseSchema() {
        const input = document.getElementById('schemaInput').value.trim();
        if (!input) {
            this.showStatus('Please provide schema input', 'error');
            return;
        }

        const format = document.querySelector('input[name="format"]:checked').value;
        
        try {
            if (format === 'json') {
                this.parsedData = this.parseJSON(input);
            } else if (format === 'xml') {
                this.parsedData = this.parseXML(input);
            }
            
            this.schema = this.parsedData;
            this.showStatus('Schema parsed successfully', 'success');
            this.updateSchemaPreview();
            this.generateDictionary();
            this.generateDiagram();
            
        } catch (error) {
            this.showStatus(`Parse error: ${error.message}`, 'error');
        }
    }

    parseJSON(jsonString) {
        const data = JSON.parse(jsonString);
        return this.normalizeSchema(data);
    }

    parseXML(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
        
        if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
            throw new Error('Invalid XML format');
        }

        return this.convertXMLToSchema(xmlDoc);
    }

    convertXMLToSchema(xmlDoc) {
        const database = xmlDoc.documentElement;
        const schema = {
            database: database.getAttribute('name') || 'Unknown',
            tables: [],
            relationships: []
        };

        // Parse tables
        const tables = database.getElementsByTagName('table');
        for (let table of tables) {
            const tableObj = {
                name: table.getAttribute('name'),
                type: table.getAttribute('type') || 'table',
                columns: []
            };

            const columns = table.getElementsByTagName('column');
            for (let column of columns) {
                const columnObj = {
                    name: column.getAttribute('name'),
                    type: column.getAttribute('type'),
                    nullable: column.getAttribute('nullable') === 'true',
                    primary_key: column.getAttribute('primary_key') === 'true',
                    foreign_key: column.getAttribute('foreign_key') === 'true',
                    unique: column.getAttribute('unique') === 'true',
                    auto_increment: column.getAttribute('auto_increment') === 'true',
                    default: column.getAttribute('default')
                };
                tableObj.columns.push(columnObj);
            }
            schema.tables.push(tableObj);
        }

        // Parse relationships
        const relationships = database.getElementsByTagName('relationship');
        for (let rel of relationships) {
            const relObj = {
                from_table: rel.getAttribute('from_table'),
                from_column: rel.getAttribute('from_column'),
                to_table: rel.getAttribute('to_table'),
                to_column: rel.getAttribute('to_column'),
                type: rel.getAttribute('type') || 'foreign_key'
            };
            schema.relationships.push(relObj);
        }

        return this.normalizeSchema(schema);
    }

    normalizeSchema(data) {
        // Ensure consistent structure
        const normalized = {
            database: data.database || 'Unknown Database',
            tables: data.tables || [],
            relationships: data.relationships || []
        };

        // Normalize tables
        normalized.tables = normalized.tables.map(table => ({
            name: table.name,
            type: table.type || 'table',
            description: table.description || '',
            columns: (table.columns || []).map(column => ({
                name: column.name,
                type: column.type || column.data_type || 'VARCHAR',
                nullable: column.nullable !== false,
                primary_key: column.primary_key || column.key === 'PRI' || false,
                foreign_key: column.foreign_key || column.key === 'MUL' || false,
                unique: column.unique || column.key === 'UNI' || false,
                auto_increment: column.auto_increment || column.extra === 'auto_increment' || false,
                default: column.default || column.column_default || null,
                description: column.description || ''
            }))
        }));

        return normalized;
    }

    updateSchemaPreview() {
        if (!this.parsedData) return;

        const summary = document.getElementById('schemaSummary');
        const tableCount = this.parsedData.tables.length;
        const relationshipCount = this.parsedData.relationships.length;
        const totalColumns = this.parsedData.tables.reduce((sum, table) => sum + table.columns.length, 0);

        summary.innerHTML = `
            <div class="summary-stats">
                <div class="stat">
                    <span class="stat-number">${tableCount}</span>
                    <span class="stat-label">Tables</span>
                </div>
                <div class="stat">
                    <span class="stat-number">${totalColumns}</span>
                    <span class="stat-label">Columns</span>
                </div>
                <div class="stat">
                    <span class="stat-number">${relationshipCount}</span>
                    <span class="stat-label">Relationships</span>
                </div>
            </div>
            <div class="table-list">
                <h4>Tables:</h4>
                <ul>
                    ${this.parsedData.tables.map(table => 
                        `<li><strong>${table.name}</strong> (${table.columns.length} columns)</li>`
                    ).join('')}
                </ul>
            </div>
        `;
    }

    generateDiagram() {
        if (!this.parsedData) {
            document.getElementById('diagramContainer').innerHTML = 
                '<div class="diagram-placeholder"><p>📊 Load a schema to generate the relationship diagram</p></div>';
            return;
        }

        const container = document.getElementById('diagramContainer');
        container.innerHTML = ''; // Clear existing diagram

        const width = container.clientWidth || 800;
        const height = 600;

        // Create SVG
        const svg = d3.select('#diagramContainer')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .style('border', '1px solid #ddd');

        // Add zoom behavior
        const g = svg.append('g');
        const zoom = d3.zoom()
            .scaleExtent([0.1, 3])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });
        svg.call(zoom);

        this.renderDiagram(g, width, height);
    }

    renderDiagram(svg, width, height) {
        const tables = this.parsedData.tables;
        const relationships = this.parsedData.relationships;
        const layoutType = document.getElementById('layoutType').value;
        const showColumns = document.getElementById('showColumns').checked;
        const showTypes = document.getElementById('showTypes').checked;
        const showKeys = document.getElementById('showKeys').checked;

        // Create nodes for tables
        const nodes = tables.map(table => ({
            id: table.name,
            name: table.name,
            type: table.type,
            columns: table.columns,
            x: Math.random() * width,
            y: Math.random() * height
        }));

        // Create links for relationships
        const links = relationships.map(rel => ({
            source: rel.from_table,
            target: rel.to_table,
            type: rel.type,
            from_column: rel.from_column,
            to_column: rel.to_column
        }));

        // Set up force simulation based on layout type
        let simulation;
        if (layoutType === 'force') {
            simulation = d3.forceSimulation(nodes)
                .force('link', d3.forceLink(links).id(d => d.id).distance(200))
                .force('charge', d3.forceManyBody().strength(-300))
                .force('center', d3.forceCenter(width / 2, height / 2))
                .force('collision', d3.forceCollide().radius(100));
        } else if (layoutType === 'circular') {
            const radius = Math.min(width, height) / 3;
            nodes.forEach((node, i) => {
                const angle = (i / nodes.length) * 2 * Math.PI;
                node.x = width / 2 + radius * Math.cos(angle);
                node.y = height / 2 + radius * Math.sin(angle);
                node.fx = node.x;
                node.fy = node.y;
            });
            simulation = d3.forceSimulation(nodes)
                .force('link', d3.forceLink(links).id(d => d.id).distance(150));
        } else if (layoutType === 'hierarchical') {
            // Simple hierarchical layout
            const levels = this.calculateHierarchy(nodes, links);
            nodes.forEach(node => {
                node.y = levels[node.id] * 150 + 100;
                node.fy = node.y;
            });
            simulation = d3.forceSimulation(nodes)
                .force('link', d3.forceLink(links).id(d => d.id).distance(200))
                .force('x', d3.forceX(width / 2).strength(0.1));
        }

        // Draw links
        const link = svg.selectAll('.link')
            .data(links)
            .enter().append('line')
            .attr('class', 'link')
            .attr('stroke', '#999')
            .attr('stroke-width', 2)
            .attr('marker-end', 'url(#arrowhead)');

        // Add arrowhead marker
        svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', 13)
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 13)
            .attr('markerHeight', 13)
            .attr('xoverflow', 'visible')
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', '#999')
            .style('stroke', 'none');

        // Draw nodes (tables)
        const node = svg.selectAll('.node')
            .data(nodes)
            .enter().append('g')
            .attr('class', 'node')
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        // Table rectangles
        const tableHeight = showColumns ? Math.max(60, nodes[0]?.columns?.length * 20 + 40) : 60;
        node.append('rect')
            .attr('width', 200)
            .attr('height', d => showColumns ? Math.max(60, d.columns.length * 20 + 40) : 60)
            .attr('fill', d => d.type === 'view' ? '#e8f4fd' : '#f9f9f9')
            .attr('stroke', '#333')
            .attr('stroke-width', 2)
            .attr('rx', 5);

        // Table names
        node.append('text')
            .attr('x', 100)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .attr('font-weight', 'bold')
            .attr('font-size', '14px')
            .text(d => d.name);

        // Column details
        if (showColumns) {
            node.each(function(d) {
                const nodeGroup = d3.select(this);
                d.columns.forEach((column, i) => {
                    const y = 40 + i * 20;
                    
                    // Column name
                    let columnText = column.name;
                    if (showTypes) {
                        columnText += ` : ${column.type}`;
                    }
                    
                    const text = nodeGroup.append('text')
                        .attr('x', 10)
                        .attr('y', y)
                        .attr('font-size', '12px')
                        .text(columnText);
                    
                    // Key indicators
                    if (showKeys) {
                        if (column.primary_key) {
                            text.attr('font-weight', 'bold').attr('fill', '#d4af37');
                            nodeGroup.append('circle')
                                .attr('cx', 185)
                                .attr('cy', y - 4)
                                .attr('r', 4)
                                .attr('fill', '#d4af37')
                                .attr('title', 'Primary Key');
                        } else if (column.foreign_key) {
                            nodeGroup.append('circle')
                                .attr('cx', 185)
                                .attr('cy', y - 4)
                                .attr('r', 4)
                                .attr('fill', '#ff6b6b')
                                .attr('title', 'Foreign Key');
                        }
                    }
                });
            });
        }

        // Update positions on simulation tick
        if (simulation) {
            simulation.on('tick', () => {
                link
                    .attr('x1', d => d.source.x + 100)
                    .attr('y1', d => d.source.y + 30)
                    .attr('x2', d => d.target.x + 100)
                    .attr('y2', d => d.target.y + 30);

                node
                    .attr('transform', d => `translate(${d.x},${d.y})`);
            });
        }

        // Drag functions
        function dragstarted(event, d) {
            if (!event.active && simulation) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active && simulation) simulation.alphaTarget(0);
            if (layoutType === 'force') {
                d.fx = null;
                d.fy = null;
            }
        }
    }

    calculateHierarchy(nodes, links) {
        const levels = {};
        const visited = new Set();
        const inDegree = {};
        
        // Initialize in-degree count
        nodes.forEach(node => {
            inDegree[node.id] = 0;
            levels[node.id] = 0;
        });
        
        // Calculate in-degrees
        links.forEach(link => {
            inDegree[link.target]++;
        });
        
        // Find root nodes (no incoming edges)
        const queue = nodes.filter(node => inDegree[node.id] === 0).map(node => node.id);
        
        // BFS to assign levels
        while (queue.length > 0) {
            const current = queue.shift();
            visited.add(current);
            
            links.forEach(link => {
                if (link.source === current && !visited.has(link.target)) {
                    levels[link.target] = Math.max(levels[link.target], levels[current] + 1);
                    inDegree[link.target]--;
                    if (inDegree[link.target] === 0) {
                        queue.push(link.target);
                    }
                }
            });
        }
        
        return levels;
    }

    generateDictionary() {
        if (!this.parsedData) {
            document.getElementById('dictionaryContent').innerHTML = 
                '<div class="dictionary-placeholder"><p>📚 Load a schema to generate the data dictionary</p></div>';
            return;
        }

        const content = document.getElementById('dictionaryContent');
        const tables = this.parsedData.tables;

        let html = `
            <div class="dictionary-header">
                <h3>Database: ${this.parsedData.database}</h3>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
        `;

        tables.forEach(table => {
            html += `
                <div class="table-section" data-table-name="${table.name}" data-table-type="${table.type}">
                    <div class="table-header">
                        <h3>${table.name} <span class="table-type">(${table.type})</span></h3>
                        ${table.description ? `<p class="table-description">${table.description}</p>` : ''}
                    </div>
                    <div class="columns-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Column</th>
                                    <th>Type</th>
                                    <th>Nullable</th>
                                    <th>Key</th>
                                    <th>Default</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${table.columns.map(column => `
                                    <tr>
                                        <td class="column-name">${column.name}</td>
                                        <td class="column-type">${column.type}</td>
                                        <td class="column-nullable">${column.nullable ? 'Yes' : 'No'}</td>
                                        <td class="column-key">
                                            ${column.primary_key ? '<span class="key-badge pk">PK</span>' : ''}
                                            ${column.foreign_key ? '<span class="key-badge fk">FK</span>' : ''}
                                            ${column.unique ? '<span class="key-badge uk">UK</span>' : ''}
                                        </td>
                                        <td class="column-default">${column.default || '-'}</td>
                                        <td class="column-description">${column.description || '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        });

        // Add relationships section
        if (this.parsedData.relationships.length > 0) {
            html += `
                <div class="relationships-section">
                    <h3>Relationships</h3>
                    <table class="relationships-table">
                        <thead>
                            <tr>
                                <th>From Table</th>
                                <th>From Column</th>
                                <th>To Table</th>
                                <th>To Column</th>
                                <th>Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.parsedData.relationships.map(rel => `
                                <tr>
                                    <td>${rel.from_table}</td>
                                    <td>${rel.from_column}</td>
                                    <td>${rel.to_table}</td>
                                    <td>${rel.to_column}</td>
                                    <td>${rel.type}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        content.innerHTML = html;
    }

    filterDictionary(searchTerm = '') {
        const filterType = document.getElementById('filterByType').value;
        const searchValue = searchTerm || document.getElementById('searchTables').value;
        
        const tableSections = document.querySelectorAll('.table-section');
        
        tableSections.forEach(section => {
            const tableName = section.dataset.tableName.toLowerCase();
            const tableType = section.dataset.tableType;
            
            const matchesSearch = !searchValue || tableName.includes(searchValue.toLowerCase());
            const matchesType = !filterType || tableType === filterType;
            
            section.style.display = (matchesSearch && matchesType) ? 'block' : 'none';
        });
    }

    loadSampleSchema() {
        const sampleSchema = {
            "database": "ecommerce_sample",
            "tables": [
                {
                    "name": "users",
                    "type": "table",
                    "description": "Customer information",
                    "columns": [
                        {
                            "name": "id",
                            "type": "INT",
                            "nullable": false,
                            "primary_key": true,
                            "auto_increment": true,
                            "description": "Unique user identifier"
                        },
                        {
                            "name": "email",
                            "type": "VARCHAR(255)",
                            "nullable": false,
                            "unique": true,
                            "description": "User email address"
                        },
                        {
                            "name": "first_name",
                            "type": "VARCHAR(100)",
                            "nullable": false,
                            "description": "User first name"
                        },
                        {
                            "name": "last_name",
                            "type": "VARCHAR(100)",
                            "nullable": false,
                            "description": "User last name"
                        },
                        {
                            "name": "created_at",
                            "type": "TIMESTAMP",
                            "nullable": false,
                            "default": "CURRENT_TIMESTAMP",
                            "description": "Account creation timestamp"
                        }
                    ]
                },
                {
                    "name": "products",
                    "type": "table",
                    "description": "Product catalog",
                    "columns": [
                        {
                            "name": "id",
                            "type": "INT",
                            "nullable": false,
                            "primary_key": true,
                            "auto_increment": true,
                            "description": "Unique product identifier"
                        },
                        {
                            "name": "name",
                            "type": "VARCHAR(255)",
                            "nullable": false,
                            "description": "Product name"
                        },
                        {
                            "name": "price",
                            "type": "DECIMAL(10,2)",
                            "nullable": false,
                            "description": "Product price"
                        },
                        {
                            "name": "category_id",
                            "type": "INT",
                            "nullable": true,
                            "foreign_key": true,
                            "description": "Reference to category"
                        }
                    ]
                },
                {
                    "name": "orders",
                    "type": "table",
                    "description": "Customer orders",
                    "columns": [
                        {
                            "name": "id",
                            "type": "INT",
                            "nullable": false,
                            "primary_key": true,
                            "auto_increment": true,
                            "description": "Unique order identifier"
                        },
                        {
                            "name": "user_id",
                            "type": "INT",
                            "nullable": false,
                            "foreign_key": true,
                            "description": "Reference to user"
                        },
                        {
                            "name": "total_amount",
                            "type": "DECIMAL(10,2)",
                            "nullable": false,
                            "description": "Order total amount"
                        },
                        {
                            "name": "status",
                            "type": "ENUM('pending','processing','shipped','delivered')",
                            "nullable": false,
                            "default": "pending",
                            "description": "Order status"
                        },
                        {
                            "name": "created_at",
                            "type": "TIMESTAMP",
                            "nullable": false,
                            "default": "CURRENT_TIMESTAMP",
                            "description": "Order creation timestamp"
                        }
                    ]
                },
                {
                    "name": "categories",
                    "type": "table",
                    "description": "Product categories",
                    "columns": [
                        {
                            "name": "id",
                            "type": "INT",
                            "nullable": false,
                            "primary_key": true,
                            "auto_increment": true,
                            "description": "Unique category identifier"
                        },
                        {
                            "name": "name",
                            "type": "VARCHAR(100)",
                            "nullable": false,
                            "description": "Category name"
                        }
                    ]
                }
            ],
            "relationships": [
                {
                    "from_table": "orders",
                    "from_column": "user_id",
                    "to_table": "users",
                    "to_column": "id",
                    "type": "foreign_key"
                },
                {
                    "from_table": "products",
                    "from_column": "category_id",
                    "to_table": "categories",
                    "to_column": "id",
                    "type": "foreign_key"
                }
            ]
        };

        document.getElementById('schemaInput').value = JSON.stringify(sampleSchema, null, 2);
        document.querySelector('input[value="json"]').checked = true;
        this.showStatus('Sample schema loaded', 'success');
    }

    clearInput() {
        document.getElementById('schemaInput').value = '';
        document.getElementById('fileInput').value = '';
        this.parsedData = null;
        this.schema = null;
        document.getElementById('schemaSummary').innerHTML = '';
        document.getElementById('diagramContainer').innerHTML = 
            '<div class="diagram-placeholder"><p>📊 Load a schema to generate the relationship diagram</p></div>';
        document.getElementById('dictionaryContent').innerHTML = 
            '<div class="dictionary-placeholder"><p>📚 Load a schema to generate the data dictionary</p></div>';
        this.showStatus('Input cleared', 'info');
    }

    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('parseStatus');
        statusElement.textContent = message;
        statusElement.className = `status-message ${type}`;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = 'status-message';
        }, 3000);
    }

    // Export functions
    exportHTML() {
        if (!this.parsedData) {
            this.showStatus('No data to export', 'error');
            return;
        }

        const htmlContent = this.generateHTMLReport();
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.parsedData.database}_data_dictionary.html`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showStatus('HTML report exported', 'success');
    }

    exportPDF() {
        if (!this.parsedData) {
            this.showStatus('No data to export', 'error');
            return;
        }

        // This is a simplified PDF export - in a real implementation,
        // you might want to use a more sophisticated PDF library
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        pdf.setFontSize(20);
        pdf.text(`Data Dictionary: ${this.parsedData.database}`, 20, 30);
        
        let yPosition = 50;
        
        this.parsedData.tables.forEach(table => {
            if (yPosition > 250) {
                pdf.addPage();
                yPosition = 30;
            }
            
            pdf.setFontSize(16);
            pdf.text(table.name, 20, yPosition);
            yPosition += 10;
            
            pdf.setFontSize(10);
            table.columns.forEach(column => {
                if (yPosition > 270) {
                    pdf.addPage();
                    yPosition = 30;
                }
                pdf.text(`  ${column.name}: ${column.type}`, 25, yPosition);
                yPosition += 7;
            });
            
            yPosition += 10;
        });
        
        pdf.save(`${this.parsedData.database}_data_dictionary.pdf`);
        this.showStatus('PDF exported', 'success');
    }

    exportImage() {
        const diagramSvg = document.querySelector('#diagramContainer svg');
        if (!diagramSvg) {
            this.showStatus('No diagram to export', 'error');
            return;
        }

        html2canvas(diagramSvg).then(canvas => {
            const link = document.createElement('a');
            link.download = `${this.parsedData.database}_diagram.png`;
            link.href = canvas.toDataURL();
            link.click();
            this.showStatus('Diagram image exported', 'success');
        });
    }

    exportJSON() {
        if (!this.parsedData) {
            this.showStatus('No data to export', 'error');
            return;
        }

        const jsonString = JSON.stringify(this.parsedData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.parsedData.database}_schema.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showStatus('JSON schema exported', 'success');
    }

    generateHTMLReport() {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Dictionary - ${this.parsedData.database}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .table-section { margin-bottom: 30px; }
        .table-header h3 { color: #333; margin-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .key-badge { padding: 2px 6px; border-radius: 3px; font-size: 10px; color: white; }
        .pk { background-color: #d4af37; }
        .fk { background-color: #ff6b6b; }
        .uk { background-color: #4ecdc4; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Data Dictionary: ${this.parsedData.database}</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
    </div>
    
    ${this.parsedData.tables.map(table => `
        <div class="table-section">
            <div class="table-header">
                <h3>${table.name} (${table.type})</h3>
                ${table.description ? `<p>${table.description}</p>` : ''}
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Column</th>
                        <th>Type</th>
                        <th>Nullable</th>
                        <th>Key</th>
                        <th>Default</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    ${table.columns.map(column => `
                        <tr>
                            <td>${column.name}</td>
                            <td>${column.type}</td>
                            <td>${column.nullable ? 'Yes' : 'No'}</td>
                            <td>
                                ${column.primary_key ? '<span class="key-badge pk">PK</span>' : ''}
                                ${column.foreign_key ? '<span class="key-badge fk">FK</span>' : ''}
                                ${column.unique ? '<span class="key-badge uk">UK</span>' : ''}
                            </td>
                            <td>${column.default || '-'}</td>
                            <td>${column.description || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `).join('')}
    
    ${this.parsedData.relationships.length > 0 ? `
        <div class="relationships-section">
            <h3>Relationships</h3>
            <table>
                <thead>
                    <tr>
                        <th>From Table</th>
                        <th>From Column</th>
                        <th>To Table</th>
                        <th>To Column</th>
                        <th>Type</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.parsedData.relationships.map(rel => `
                        <tr>
                            <td>${rel.from_table}</td>
                            <td>${rel.from_column}</td>
                            <td>${rel.to_table}</td>
                            <td>${rel.to_column}</td>
                            <td>${rel.type}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    ` : ''}
</body>
</html>
        `;
    }

    loadSampleData() {
        // This method can be used to load sample data on initialization if needed
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DataDictionaryTool();
});