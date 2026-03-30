import React, { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
    } from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    } from "@/components/ui/pagination"


const StudentProfile = () => {
    const invoices = [
    {
        invoice: "TNS",
        paymentStatus: 14,
        totalAmount: 4,
        paymentMethod: 15,
    }
    ]
    const tables = [
        (<Table className='mb-4'>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[100px]">Course</TableHead>
                    <TableHead>Interro</TableHead>
                    <TableHead>Examen</TableHead>
                    <TableHead className="text-right">Coefficient</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                    <TableRow key={invoice.invoice}>
                        <TableCell className="font-medium">{invoice.invoice}</TableCell>
                        <TableCell>{invoice.paymentStatus}</TableCell>
                        <TableCell>{invoice.paymentMethod}</TableCell>
                        <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                    <TableCell colSpan={3}>Average</TableCell>
                    <TableCell className="text-right">14.5</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>),
            (<Table className='mb-4'>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[100px]">Course</TableHead>
                    <TableHead>Interro</TableHead>
                    <TableHead>Examen</TableHead>
                    <TableHead className="text-right">Coefficient</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                    <TableRow key={invoice.invoice}>
                        <TableCell className="font-medium">{invoice.invoice}</TableCell>
                        <TableCell>{invoice.paymentStatus}</TableCell>
                        <TableCell>{invoice.paymentMethod}</TableCell>
                        <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                    <TableCell colSpan={3}>Average</TableCell>
                    <TableCell className="text-right">14.5</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>),
            (<Table className='mb-2'>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[100px]">Course</TableHead>
                    <TableHead>Interro</TableHead>
                    <TableHead>Examen</TableHead>
                    <TableHead className="text-right">Coefficient</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                    <TableRow key={invoice.invoice}>
                        <TableCell className="font-medium">{invoice.invoice}</TableCell>
                        <TableCell>{invoice.paymentStatus}</TableCell>
                        <TableCell>{invoice.paymentMethod}</TableCell>
                        <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                    <TableCell colSpan={3}>Average</TableCell>
                    <TableCell className="text-right">14.5</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>),
            (<Table className='mb-4'>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[100px]">Course</TableHead>
                    <TableHead>Interro</TableHead>
                    <TableHead>Examen</TableHead>
                    <TableHead className="text-right">Coefficient</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                    <TableRow key={invoice.invoice}>
                        <TableCell className="font-medium">{invoice.invoice}</TableCell>
                        <TableCell>{invoice.paymentStatus}</TableCell>
                        <TableCell>{invoice.paymentMethod}</TableCell>
                        <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                    <TableCell colSpan={3}>Average</TableCell>
                    <TableCell className="text-right">14.5</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>),
            (<Table className='mb-4'>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[100px]">Course</TableHead>
                    <TableHead>Interro</TableHead>
                    <TableHead>Examen</TableHead>
                    <TableHead className="text-right">Coefficient</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                    <TableRow key={invoice.invoice}>
                        <TableCell className="font-medium">{invoice.invoice}</TableCell>
                        <TableCell>{invoice.paymentStatus}</TableCell>
                        <TableCell>{invoice.paymentMethod}</TableCell>
                        <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                    <TableCell colSpan={3}>Average</TableCell>
                    <TableCell className="text-right">14.5</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>),
            (<Table className='mb-4'>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[100px]">Course</TableHead>
                    <TableHead>Interro</TableHead>
                    <TableHead>Examen</TableHead>
                    <TableHead className="text-right">Coefficient</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                    <TableRow key={invoice.invoice}>
                        <TableCell className="font-medium">{invoice.invoice}</TableCell>
                        <TableCell>{invoice.paymentStatus}</TableCell>
                        <TableCell>{invoice.paymentMethod}</TableCell>
                        <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                    <TableCell colSpan={3}>Average</TableCell>
                    <TableCell className="text-right">14.5</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>),
            (<Table className='mb-4'>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[100px]">Course</TableHead>
                    <TableHead>Interro</TableHead>
                    <TableHead>Examen</TableHead>
                    <TableHead className="text-right">Coefficient</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                    <TableRow key={invoice.invoice}>
                        <TableCell className="font-medium">{invoice.invoice}</TableCell>
                        <TableCell>{invoice.paymentStatus}</TableCell>
                        <TableCell>{invoice.paymentMethod}</TableCell>
                        <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                    <TableCell colSpan={3}>Average</TableCell>
                    <TableCell className="text-right">14.5</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>),
            (<Table className='mb-4'>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[100px]">Course</TableHead>
                    <TableHead>Interro</TableHead>
                    <TableHead>Examen</TableHead>
                    <TableHead className="text-right">Coefficient</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                    <TableRow key={invoice.invoice}>
                        <TableCell className="font-medium">{invoice.invoice}</TableCell>
                        <TableCell>{invoice.paymentStatus}</TableCell>
                        <TableCell>{invoice.paymentMethod}</TableCell>
                        <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                    <TableCell colSpan={3}>Average</TableCell>
                    <TableCell className="text-right">14.5</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>),
            (<Table className='mb-4'>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[100px]">Course</TableHead>
                    <TableHead>Interro</TableHead>
                    <TableHead>Examen</TableHead>
                    <TableHead className="text-right">Coefficient</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                    <TableRow key={invoice.invoice}>
                        <TableCell className="font-medium">{invoice.invoice}</TableCell>
                        <TableCell>{invoice.paymentStatus}</TableCell>
                        <TableCell>{invoice.paymentMethod}</TableCell>
                        <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                    <TableCell colSpan={3}>Average</TableCell>
                    <TableCell className="text-right">14.5</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>),
            (<Table className='mb-4'>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[100px]">Course</TableHead>
                    <TableHead>Interro</TableHead>
                    <TableHead>Examen</TableHead>
                    <TableHead className="text-right">Coefficient</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                    <TableRow key={invoice.invoice}>
                        <TableCell className="font-medium">{invoice.invoice}</TableCell>
                        <TableCell>{invoice.paymentStatus}</TableCell>
                        <TableCell>{invoice.paymentMethod}</TableCell>
                        <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                    <TableCell colSpan={3}>Average</TableCell>
                    <TableCell className="text-right">14.5</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>)
    ]
    const [currentPage, setCurrentPage] = useState(1);
    const tablesPerPage = 3;
    const indexOfLastTable = currentPage * tablesPerPage;
    const indexOfFirstTable = indexOfLastTable - tablesPerPage;
    const currentTables = tables.slice(indexOfFirstTable, indexOfLastTable);
    const totalPages = Math.ceil(tables.length / tablesPerPage);

    return (
        <div className='mt-4'>
            <h2 className='mb-4'>Your Grades Are :</h2>
            {currentTables.map((table, idx) => (
                <div key={idx}>{table}</div>
            ))}
            
            <Pagination className='mt-4'>
            <PaginationContent>
                <PaginationItem>
                <PaginationPrevious 
                href="#" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                    <PaginationLink href="#" isActive={currentPage === i + 1} onClick={() => setCurrentPage(i + 1)}
                    >
                        {i + 1}
                    </PaginationLink>
                </PaginationItem>
                ))}
                <PaginationItem>
                <PaginationNext 
                href="#" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                />
                </PaginationItem>
            </PaginationContent>
            </Pagination>
        </div>
    )
}

export default StudentProfile