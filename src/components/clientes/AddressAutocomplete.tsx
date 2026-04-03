'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';

interface NominatimResult {
    place_id: number;
    display_name: string;
    address: {
        road?: string;
        house_number?: string;
        city?: string;
        town?: string;
        village?: string;
        state?: string;
        country?: string;
    };
}

interface AddressAutocompleteProps {
    onAddressSelect: (addressData: { direccion: string; ciudad: string; provincia: string }) => void;
    defaultValue?: string;
}

export default function AddressAutocomplete({ onAddressSelect, defaultValue = '' }: AddressAutocompleteProps) {
    const [query, setQuery] = useState(defaultValue);
    const [results, setResults] = useState<NominatimResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchAddress = async (searchTerm: string) => {
        setQuery(searchTerm);
        
        if (searchTerm.length < 4) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        try {
            // Using OpenStreetMap Nominatim Free API
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&addressdetails=1&countrycodes=uy&limit=5`,
                {
                    headers: {
                        'Accept-Language': 'es'
                    }
                }
            );
            const data = await response.json();
            setResults(data);
            setIsOpen(true);
        } catch (error) {
            console.error('Error fetching address:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = (result: NominatimResult) => {
        const addr = result.address;
        
        // Clean up the street name
        const street = addr.road || '';
        const number = addr.house_number ? ` ${addr.house_number}` : '';
        const direccionLimpia = `${street}${number}`.trim();

        // Find the best match for city and province
        const ciudadLimpia = addr.city || addr.town || addr.village || '';
        const provinciaLimpia = addr.state || '';

        setQuery(result.display_name); // Show full address in input
        setIsOpen(false);

        // Send split data back to parent form
        onAddressSelect({
            direccion: direccionLimpia || result.display_name.split(',')[0],
            ciudad: ciudadLimpia,
            provincia: provinciaLimpia,
        });
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => searchAddress(e.target.value)}
                    placeholder="Escribe para buscar calle y número (Ej: Av. Rivadavia 1234)..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                    autoComplete="off"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                </div>
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                    <ul className="max-h-60 overflow-y-auto">
                        {results.map((result) => (
                            <li 
                                key={result.place_id}
                                onClick={() => handleSelect(result)}
                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-start gap-3 border-b border-slate-100 last:border-0 transition-colors"
                            >
                                <MapPin className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-slate-800 line-clamp-1">
                                        {(result.address.road || result.display_name.split(',')[0])} {result.address.house_number || ''}
                                    </p>
                                    <p className="text-xs text-slate-500 line-clamp-1">
                                        {result.display_name}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="bg-slate-50 px-3 py-2 text-[10px] text-slate-400 text-right border-t border-slate-200">
                        Resultados provistos por OpenStreetMap
                    </div>
                </div>
            )}
        </div>
    );
}
