import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import statesData from '../data/states.json'

interface MapViewerProps {
  onSelectRegion: (regionId: string) => void
  onBack: () => void
}

interface SelectedState {
  abbr: string
  name: string
  capital: string
  regionId: string
  population?: string
  fun_facts?: string[]
  landmarks?: string[]
}

const MapViewer: React.FC<MapViewerProps> = ({ onSelectRegion, onBack }) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedRegion, setSelectedRegion] = React.useState<string | null>(null)
  const [selectedState, setSelectedState] = React.useState<SelectedState | null>(null)
  const [showTooltips, setShowTooltips] = React.useState(true)

  // Build state to region map and state abbreviation map
  const stateToRegion = new Map<string, string>()
  const stateAbbrToName = new Map<string, string>()
  const regionInfo = new Map<string, { name: string; icon: string; color: string }>()
  const fipsToStateAbbr = new Map<string, string>()

  const regionColors: Record<string, string> = {
    northeast: '#60A5FA',
    southeast: '#F87171',
    midwest: '#FBBF24',
    southwest: '#FB923C',
    mountain: '#A78BFA',
    pacific: '#34D399',
    islands: '#06B6D4',
  }

  statesData.regions.forEach((region: any) => {
    regionInfo.set(region.id, {
      name: region.name,
      icon: region.icon,
      color: regionColors[region.id] || '#9CA3AF',
    })
    region.states.forEach((state: any) => {
      stateToRegion.set(state.abbr, region.id)
      stateAbbrToName.set(state.abbr, state.name)
    })
  })

  useEffect(() => {
    const width = 960
    const height = 600

    if (!svgRef.current) return

    // Clean up any orphaned tooltips from previous renders
    d3.selectAll('div[data-tooltip="map"]').remove()

    d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then((us: any) => {
      const states = topojson.feature(us, us.objects.states)
      const stateMesh = topojson.mesh(us, us.objects.states)

      const projection = d3
        .geoAlbersUsa()
        .fitSize([width, height], states as any)

      const path = d3.geoPath().projection(projection)

      const svg = d3
        .select(svgRef.current)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')

      // Clear previous content
      svg.selectAll('*').remove()

      // Add tooltip
      const tooltip = d3
        .select('body')
        .append('div')
        .attr('data-tooltip', 'map')
        .style('position', 'absolute')
        .style('padding', '8px 12px')
        .style('background', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('border-radius', '4px')
        .style('pointer-events', 'none')
        .style('font-size', '12px')
        .style('z-index', '1000')
        .style('opacity', 0)
        .style('transition', 'opacity 0.2s')

      // Draw states
      svg
        .selectAll('path.state')
        .data((states as any).features)
        .enter()
        .append('path')
        .attr('class', 'state')
        .attr('d', path as any)
        .attr('fill', (d: any) => {
          const stateFips = String(d.id).padStart(2, '0')
          const stateAbbr = getStateAbbrFromFips(stateFips)
          if (stateAbbr) {
            const regionId = stateToRegion.get(stateAbbr)
            if (regionId) {
              const region = regionInfo.get(regionId)
              return region?.color || '#E5E7EB'
            }
          }
          return '#E5E7EB'
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .style('cursor', 'pointer')
        .on('mouseenter', function (e: any, d: any) {
          const stateFips = String(d.id).padStart(2, '0')
          const stateAbbr = getStateAbbrFromFips(stateFips)
          const stateName = stateAbbrToName.get(stateAbbr || '') || 'Unknown'

          d3.select(this).attr('stroke-width', 2.5).attr('opacity', 0.8)

          if (showTooltips) {
            // Find capital from state data
            let capital = ''
            statesData.regions.forEach((region: any) => {
              const state = region.states.find((s: any) => s.abbr === stateAbbr)
              if (state) {
                capital = state.capital
              }
            })

            tooltip
              .style('opacity', 1)
              .html(`<strong>${stateName}</strong><br/>${capital}`)
              .style('left', e.pageX + 10 + 'px')
              .style('top', e.pageY - 10 + 'px')
          }
        })
        .on('mousemove', function (e: any) {
          if (showTooltips) {
            tooltip.style('left', e.pageX + 10 + 'px').style('top', e.pageY - 10 + 'px')
          }
        })
        .on('mouseleave', function (e: any) {
          d3.select(this).attr('stroke-width', 1.5).attr('opacity', 1)
          tooltip.style('opacity', 0)
        })
        .on('click', function (e: any, d: any) {
          const stateFips = String(d.id).padStart(2, '0')
          const stateAbbr = getStateAbbrFromFips(stateFips)
          if (stateAbbr) {
            const regionId = stateToRegion.get(stateAbbr)
            const stateName = stateAbbrToName.get(stateAbbr)
            if (regionId && stateName) {
              // Find all state details from the states data
              let stateDetails: any = {
                abbr: stateAbbr,
                name: stateName,
                capital: '',
                regionId: regionId,
              }
              statesData.regions.forEach((region: any) => {
                const state = region.states.find((s: any) => s.abbr === stateAbbr)
                if (state) {
                  stateDetails.capital = state.capital
                  stateDetails.population = state.population
                  stateDetails.fun_facts = state.fun_facts
                  stateDetails.landmarks = state.landmarks
                }
              })
              setSelectedState(stateDetails)
            }
          }
        })

      // Draw mesh
      svg
        .append('path')
        .attr('fill', 'none')
        .attr('stroke', '#666')
        .attr('stroke-width', 0.75)
        .attr('d', path as any)
        .datum(stateMesh)
    })

    // Clean up tooltips when component unmounts
    return () => {
      d3.selectAll('div[data-tooltip="map"]').remove()
    }
  }, [onSelectRegion, selectedRegion])

  const getStateAbbrFromFips = (fips: string): string | undefined => {
    const fipsToAbbr: Record<string, string> = {
      '01': 'AL',
      '02': 'AK',
      '04': 'AZ',
      '05': 'AR',
      '06': 'CA',
      '08': 'CO',
      '09': 'CT',
      '10': 'DE',
      '12': 'FL',
      '13': 'GA',
      '15': 'HI',
      '16': 'ID',
      '17': 'IL',
      '18': 'IN',
      '19': 'IA',
      '20': 'KS',
      '21': 'KY',
      '22': 'LA',
      '23': 'ME',
      '24': 'MD',
      '25': 'MA',
      '26': 'MI',
      '27': 'MN',
      '28': 'MS',
      '29': 'MO',
      '30': 'MT',
      '31': 'NE',
      '32': 'NV',
      '33': 'NH',
      '34': 'NJ',
      '35': 'NM',
      '36': 'NY',
      '37': 'NC',
      '38': 'ND',
      '39': 'OH',
      '40': 'OK',
      '41': 'OR',
      '42': 'PA',
      '44': 'RI',
      '45': 'SC',
      '46': 'SD',
      '47': 'TN',
      '48': 'TX',
      '49': 'UT',
      '50': 'VT',
      '51': 'VA',
      '53': 'WA',
      '54': 'WV',
      '55': 'WI',
      '56': 'WY',
    }
    return fipsToAbbr[fips]
  }

  const zoomToRegion = (regionId: string) => {
    setSelectedRegion(regionId)
    const region = regionInfo.get(regionId)
    if (region) {
      const svg = d3.select(svgRef.current)
      svg
        .selectAll('path.state')
        .attr('stroke-width', (d: any) => {
          const stateFips = String(d.id).padStart(2, '0')
          const stateAbbr = getStateAbbrFromFips(stateFips)
          if (stateAbbr) {
            const regId = stateToRegion.get(stateAbbr)
            return regId === regionId ? 2 : 0.5
          }
          return 0.5
        })
        .attr('opacity', (d: any) => {
          const stateFips = String(d.id).padStart(2, '0')
          const stateAbbr = getStateAbbrFromFips(stateFips)
          if (stateAbbr) {
            const regId = stateToRegion.get(stateAbbr)
            return regId === regionId ? 1 : 0.3
          }
          return 0.3
        })
    }
  }

  const handleStartQuiz = () => {
    if (selectedState) {
      onSelectRegion(selectedState.regionId)
    } else if (selectedRegion) {
      onSelectRegion(selectedRegion)
    }
  }

  const handleResetMap = () => {
    setSelectedRegion(null)
    setSelectedState(null)
    const svg = d3.select(svgRef.current)
    svg
      .selectAll('path.state')
      .attr('stroke-width', 1.5)
      .attr('opacity', 1)
  }

  const handleZoomFromInfo = () => {
    if (selectedState) {
      zoomToRegion(selectedState.regionId)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">🗺️ Explore by Map</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTooltips(!showTooltips)}
              className={`font-semibold py-2 px-4 rounded-lg transition ${
                showTooltips
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {showTooltips ? '👁️ Hints: ON' : '🙈 Hints: OFF'}
            </button>
            <button
              onClick={onBack}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Back
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex gap-6">
            {/* Map */}
            <div className="flex-1">
              <svg
                ref={svgRef}
                className="w-full border border-gray-200 rounded"
                style={{ maxHeight: '500px' }}
              />
              <p className="text-sm text-gray-600 mt-4 text-center">
                Click on any state to view details
              </p>

              {/* Legend */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Region Colors</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from(regionInfo.entries()).map(([regionId, region]) => (
                    <button
                      key={regionId}
                      onClick={() => zoomToRegion(regionId)}
                      className="flex items-center gap-2 p-2 rounded hover:bg-white transition cursor-pointer"
                    >
                      <div
                        className="w-4 h-4 rounded flex-shrink-0"
                        style={{ backgroundColor: region.color }}
                      ></div>
                      <span className="text-xs text-gray-700 hover:text-gray-900 font-medium">{region.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* State Info Panel */}
            {selectedState && (
              <div className="w-80 bg-blue-50 rounded-lg p-4 border-2 border-blue-200 max-h-96 overflow-y-auto">
                <h2 className="text-xl font-bold text-gray-900">{selectedState.name}</h2>
                <p className="text-sm text-gray-600 mb-3">{selectedState.abbr}</p>

                {/* Capital */}
                <div className="bg-white rounded p-3 mb-3">
                  <p className="text-xs text-gray-600 mb-1">Capital</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedState.capital}</p>
                </div>

                {/* Population */}
                {selectedState.population && (
                  <div className="bg-white rounded p-3 mb-3">
                    <p className="text-xs text-gray-600 mb-1">Population (2020 Census)</p>
                    <p className="text-base font-semibold text-gray-900">{selectedState.population}</p>
                  </div>
                )}

                {/* Fun Facts */}
                {selectedState.fun_facts && selectedState.fun_facts.length > 0 && (
                  <div className="bg-white rounded p-3 mb-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Fun Facts</p>
                    <ul className="text-xs text-gray-700 space-y-1">
                      {selectedState.fun_facts.map((fact: string, idx: number) => (
                        <li key={idx} className="flex gap-2">
                          <span>💡</span>
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Landmarks */}
                {selectedState.landmarks && selectedState.landmarks.length > 0 && (
                  <div className="bg-white rounded p-3 mb-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Landmarks</p>
                    <ul className="text-xs text-gray-700 space-y-1">
                      {selectedState.landmarks.map((landmark: string, idx: number) => (
                        <li key={idx} className="flex gap-2">
                          <span>🏛️</span>
                          <span>{landmark}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={handleZoomFromInfo}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 rounded transition text-sm"
                  >
                    Zoom to Region
                  </button>
                  <button
                    onClick={handleStartQuiz}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded transition text-sm"
                  >
                    Start Quiz
                  </button>
                  <button
                    onClick={() => setSelectedState(null)}
                    className="w-full bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-3 rounded transition text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {selectedRegion && !selectedState && (
            <div className="mt-6 flex gap-4 justify-center">
              <button
                onClick={handleStartQuiz}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition text-lg"
              >
                ✓ Start Quiz for {regionInfo.get(selectedRegion)?.name}
              </button>
              <button
                onClick={handleResetMap}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MapViewer
